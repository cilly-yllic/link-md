import { Answers, DistinctQuestion } from 'inquirer'
import { isNumber } from 'my-gadgetry/type-check'

/* eslint-disable import/no-restricted-paths */
import { DEFAULT_MD_FILENAME } from '~utils/configs.js'
import { isDirectory } from '~utils/path.js'
/* eslint-enable import/no-restricted-paths */

export const TYPES = {
  rc: 'rc',
  link: 'link',
} as const

export type Type = (typeof TYPES)[keyof typeof TYPES]

export interface CommandOptions {
  debug?: boolean
  type?: Type
  include?: string
  exclude?: string
  filenames?: string
  input?: string
  output?: string
  idGen?: GenerateType
  depth?: number
  id?: string
  lock?: boolean
  skipHidden?: boolean
  title?: string
}

export interface MdSettings {
  include: string[]
  exclude: string[]
  filenames: string[]
  skipHidden: boolean
  input: string
  output: string
  idGen: GenerateType
  id: string
  title: string
  lock: boolean
  depth: number
}

const INPUT_QUESTION: DistinctQuestion = {
  type: 'input',
  name: 'input',
  message: 'Please put path from current dir with filename? ex: "./{path}/{filename}.md"',
}

const SKIP_HIDDEN_QUESTION: DistinctQuestion = {
  type: 'confirm',
  name: 'skipHidden',
  message: 'skip search hidden file? default Yes.',
  default: true,
}

const INCLUDE_QUESTION: DistinctQuestion = {
  type: 'input',
  name: 'include',
  message: 'include pattern minimatch list with comma. ex: xxx,xxx',
  default: '',
}

const EXCLUDE_QUESTION: DistinctQuestion = {
  type: 'input',
  name: 'exclude',
  message: 'exclude pattern minimatch list with comma. ex: xxx,xxx',
  default: '',
}

const FILENAMES_QUESTION: DistinctQuestion = {
  type: 'input',
  name: 'filenames',
  message: 'search filenames with comma. (default: README.md) ex: README.md,CHANGELOG.md',
  default: DEFAULT_MD_FILENAME,
}

const OUTPUT_QUESTION: DistinctQuestion = {
  type: 'input',
  name: 'output',
  message: 'output filename. (default: same name as read, means update file) ex: README_GENERATE.md',
}

const DEPTH_QUESTION: DistinctQuestion = {
  type: 'number',
  name: 'depth',
  message: 'search depth number. more than 0. (if all put 0)',
  validate: input => {
    return isNumber(input, true) && input >= 0
  },
  filter: input => {
    return input >= 0 ? Number(input) : ''
  },
  default: 0,
}

export const RC_QUESTIONS = (_options: CommandOptions): ReadonlyArray<DistinctQuestion> => [
  {
    ...INPUT_QUESTION,
    validate: input => {
      return !!input
    },
  },
  SKIP_HIDDEN_QUESTION,
  INCLUDE_QUESTION,
  EXCLUDE_QUESTION,
  FILENAMES_QUESTION,
  OUTPUT_QUESTION,
  DEPTH_QUESTION,
]

export const GENERATE_TYPES = Object.freeze({
  path: 'path',
  random: 'random',
  manual: 'manual',
} as const)

export type GenerateType = (typeof GENERATE_TYPES)[keyof typeof GENERATE_TYPES]

const GENERATE_TYPE_CHOICES = Object.freeze([
  { name: 'auto generate with directory path', short: 'dir path', value: GENERATE_TYPES.path },
  { name: 'auto generate with uuid', short: 'random', value: GENERATE_TYPES.random },
  { name: 'generate yourself', short: 'manually', value: GENERATE_TYPES.manual },
] as const)

// const isDirectory = (path: string) => parse(path).ext !== '.md' || _isDirectory(join(getExecDir(), path))

// const isAuto = (answers: Answers) => [GENERATE_TYPES.path, GENERATE_TYPES.random].includes(answers.idGen)
//
// const AUTO_QUESTIONS = [SKIP_HIDDEN_QUESTION, INCLUDE_QUESTION, EXCLUDE_QUESTION, FILENAMES_QUESTION]
//   .map((QUESTION) => ({ ...QUESTION, when: isAuto }))

const DIR_QUESTIONS = (options: CommandOptions) =>
  [SKIP_HIDDEN_QUESTION, INCLUDE_QUESTION, EXCLUDE_QUESTION, FILENAMES_QUESTION, DEPTH_QUESTION].map(QUESTION => ({
    ...QUESTION,
    when: (answers: Answers) => isDirectory(answers.input || options.input || ''),
  }))

const FILE_QUESTIONS = (options: CommandOptions) =>
  (
    [
      {
        type: 'input',
        name: 'title',
        message: 'title name. (default: auto detect title)',
        // validate: (input) => {
        //   return !!input
        // }
      },
      {
        type: 'confirm',
        name: 'lock',
        message: 'is locked? if true not link this file. (default: false)',
        default: false,
      },
      OUTPUT_QUESTION,
      // DEPTH_QUESTION
    ] as ReadonlyArray<DistinctQuestion>
  ).map(QUESTION => ({ ...QUESTION, when: (answers: Answers) => !isDirectory(answers.input || options.input || '') }))

export const LINK_QUESTIONS = (options: CommandOptions): ReadonlyArray<DistinctQuestion> => [
  {
    ...INPUT_QUESTION,
    message: 'Please put path from current dir with filename? (default: ".") ex: "./{path}/{filename}.md"',
    default: '.',
  },
  {
    type: 'list',
    name: 'idGen',
    message: `Choose generate type (default: ${GENERATE_TYPE_CHOICES[0].short})`,
    choices: answers => {
      if (isDirectory(answers.input || options.input || '')) {
        return GENERATE_TYPE_CHOICES.filter(({ value }) =>
          ([GENERATE_TYPES.path, GENERATE_TYPES.random] as string[]).includes(value)
        )
      }
      return GENERATE_TYPE_CHOICES
    },
    default: 0,
  },
  {
    type: 'input',
    name: 'id',
    message: 'type id',
    validate: input => {
      return !!input
    },
    when: answers => {
      return answers.idGen === GENERATE_TYPES.manual
    },
  },
  ...DIR_QUESTIONS(options),
  ...FILE_QUESTIONS(options),
]

export const QUESTIONS = (options: CommandOptions) => ({
  [TYPES.rc]: RC_QUESTIONS(options),
  [TYPES.link]: LINK_QUESTIONS(options),
})
