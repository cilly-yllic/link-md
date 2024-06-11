import { readFileSync, existsSync, writeFileSync } from 'fs'
import { parse, join } from 'path'

import inquirer from 'inquirer'
import { TablePlugin, TableQuestion } from 'inquirer-plugins/table'
import { v4 as uuid } from 'uuid'

import { MdSettings, GENERATE_TYPES } from '~types/configs/generate.js'
import { MdAttributes } from '~types/md.js'
import { success, warn, hop, cyan, bold } from '~utils/chalk.js'
import { getAllMdFiles } from '~utils/fs.js'
import { getLinkedMdDetail, removeParam, getParamsComment } from '~utils/md.js'
import { getExclude, getInclude } from '~utils/minimatch.js'
import { isDirectory as isDirectoryPath, getExecDir } from '~utils/path.js'

const PARAMS = ['id', 'title', 'output', 'lock'] as const

interface QuestionParam extends MdAttributes {
  path: string
}

const getAnswers = (details: QuestionParam[]) => {
  inquirer.registerPrompt('table', TablePlugin)
  const question: TableQuestion = {
    type: 'table',
    name: 'links',
    message: 'GENERATE LINKS PATH SETTINGS',
    description: `Edit setting.`,
    disableColumnIndexes: [0],
    colors: {
      selected: warn,
      editable: success,
      editing: hop,
    },
    columns: [
      { name: cyan.bold('filepath'), value: 'path', type: 'input' },
      { name: cyan.bold('id'), value: 'id', type: 'input' },
      { name: cyan.bold('title'), value: 'title', type: 'input' },
      { name: cyan.bold('output'), value: 'output', type: 'input' },
      { name: cyan.bold('lock'), value: 'lock', type: 'confirm' },
    ],
    rows: details.map(({ path, id, title, output, lock }) => {
      return [bold(path), id, title, output, lock]
    }),
  }
  return inquirer.prompt([question])
}

const getQuestionParam = (settings: MdSettings, path: string, md: string, prefixExp: RegExp) => {
  const detail = getLinkedMdDetail(md)
  return {
    ...detail,
    id: settings.id || getGenerateId(detail.id, settings, path, prefixExp),
    title: settings.title || detail.title,
    output: settings.output || detail.output,
    lock: settings.lock || detail.lock,
    path,
  }
}

const writeMd = (md: string, values: Record<(typeof PARAMS)[number] | 'path', string>) => {
  const comments: string[] = []
  for (const params of PARAMS) {
    const PARAM = params.toUpperCase()
    md = removeParam(md, PARAM)
    const value = values[params]
    if (value) {
      comments.push(getParamsComment({ [PARAM]: `${value}` }))
    }
  }
  const content = `${comments.join('\n')}
${md}`
  writeFileSync(values.path, content, 'utf-8')
}

const generateLink = async (settings: MdSettings, fullPath: string) => {
  const isExists = existsSync(fullPath)
  let md = ''
  if (isExists) {
    md = readFileSync(fullPath, 'utf-8')
  }
  const execDir = getExecDir()
  const prefixExp = new RegExp(`${execDir}/(.+)$`)
  const question = getQuestionParam(settings, fullPath, md, prefixExp)
  const { links } = await getAnswers([question])
  for (const result of links.result) {
    writeMd(md, result)
  }
}

const getGenerateId = (id: string, settings: MdSettings, path: string, prefixExp: RegExp) => {
  if (id) {
    return id
  }
  switch (settings.idGen) {
    case GENERATE_TYPES.path: {
      const paths = path.replace(prefixExp, '$1').split('/')
      const parsed = parse(`${paths.pop()}`)
      return `${paths.join('-')}-${parsed.name.substring(0, 1).toLowerCase()}${parsed.ext.replace(/^\./, '')}`.replace(
        /^-+/,
        ''
      )
    }
    case GENERATE_TYPES.random:
      return uuid()
    default:
      return id
  }
}

const generateLinks = async (settings: MdSettings, fullPath: string) => {
  const { depth } = settings
  const execDir = getExecDir()
  const targetDir = join(execDir, settings.input)
  const exclude = getExclude(targetDir, settings.exclude, settings.skipHidden)
  const include = getInclude(targetDir, settings.include)
  const paths = getAllMdFiles(settings.filenames, fullPath, { include, exclude, ...(depth >= 1 ? { depth } : {}) })
  const prefixExp = new RegExp(`${execDir}/(.+)$`)
  const questions: QuestionParam[] = []
  for (const path of paths) {
    const md = readFileSync(path, 'utf-8')
    questions.push(getQuestionParam(settings, path, md, prefixExp))
  }
  const { links } = await getAnswers(questions)
  console.log(links)
  for (const result of links.result) {
    writeMd(readFileSync(result.path, 'utf-8'), result)
  }
}

export const exec = (settings: MdSettings) => {
  const fullPath = join(getExecDir(), settings.input)
  if (isDirectoryPath(settings.input)) {
    return generateLinks(settings, fullPath)
  } else {
    return generateLink(settings, fullPath)
  }
}
