import { readFileSync } from 'fs'

import { Settings } from '~types/settings.js'
import { getParam } from '~utils/md.js'

import { SETTING_FILE_NAME } from './configs.js'
import { getProjectRootPath } from './path.js'

const Booleans = ['skip-hidden']
const Strings = ['exclude', 'include', 'filenames']

export const DEFAULT_MD_FILE_NAME = 'README.md'
export const DEFAULT_SETTINGS: Settings = Object.freeze({
  'skip-hidden': true,
  exclude: [],
  include: [],
  filenames: [DEFAULT_MD_FILE_NAME],
  output: DEFAULT_MD_FILE_NAME,
})

export const parse = (txt: string): Settings => {
  const lines = txt.split('\n')
  const settings: Settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS))
  for (const line of lines) {
    const keyValue = line.split(':')
    if (keyValue.length !== 2) {
      continue
    }
    const key = keyValue[0].trim() as keyof Settings
    const value: Settings[typeof key] | string = keyValue[1].trim()
    let val: Settings[typeof key]
    if (Booleans.includes(key)) {
      val = JSON.parse(`${value}`) as Settings[typeof key]
    } else if (Strings.includes(key)) {
      val = value.split(',')
    } else {
      continue
    }
    // @ts-ignore: TS7053: Element implicitly has an any type because expression of type any can't be used to index type Setting
    settings[key] = val as Settings[typeof key]
  }
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
  }
}

export const getSettings = (inputFilename: string) => {
  const readme = readFileSync(`${getProjectRootPath()}/${inputFilename || SETTING_FILE_NAME}`, 'utf-8')
  return parse(getParam(readme, 'CONFIG'))
}
