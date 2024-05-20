import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

import { ActionArg } from '~types/command.js'
import { Detail, PathDepthClassify, PathInfo } from '~types/md.js'
import { BundleOptions } from '~types/options.js'
import { Settings } from '~types/settings.js'
import { getAllFiles } from '~utils/fs.js'
import {getParam, getTitle, replace } from '~utils/md.js'
import { getProjectRootPath } from '~utils/path.js'
import {getDir, getDepthType, DEPTH_TYPES} from '~utils/path.js'


const replacePath = (str: string) => str.replace(/\/{2,}/, '/')
const splitComma = (str: string | undefined, alternative: string[]) => (str ? str.split(',') : null) || alternative

const mergeConfig = ({ options, settings }: ActionArg<BundleOptions>): Settings => {
  return {
    'skip-hidden': typeof options.skipHidden === 'undefined' ? settings['skip-hidden'] : JSON.parse(`${options.skipHidden}`),
    exclude: splitComma(options.exclude, settings.exclude),
    include: splitComma(options.include, settings.include),
    filenames: splitComma(options.filenames, settings.filenames),
    output: options.output || settings.output,
  }
}

const classify = (dataList: PathInfo[]) => {
  return dataList.reduce((mds: Detail[], data ) => {
    const classifyList: PathDepthClassify = { children: [], grandchildren: [], parallels: [] }
    for (const { dir, path } of dataList) {
      if (data.path === path) {
        continue
      }
      switch (getDepthType(dir, data.dir)) {
        case DEPTH_TYPES.parallel:
          classifyList.parallels.push(path)
          break;
        case DEPTH_TYPES.child:
          classifyList.children.push(path)
          break;
        case DEPTH_TYPES.grandchild:
          classifyList.grandchildren.push(path)
          break;
      }
    }
    mds.push({
      ...data,
      ...classifyList
    })
    return mds
  }, [])
}

const getPathDetails = (paths: string[], config: Settings) => {
  const list: PathInfo[] = []
  for (const path of paths) {
    const md = readFileSync(path, 'utf-8')
    const id = getParam(md, 'ID').trim()
    const LOCK = getParam(md, 'LOCK').trim()
    const lock = LOCK ? JSON.parse(LOCK) : false
    const dir = getDir(path)
    const output = getParam(md, 'OUTPUT').trim() || config.output
    list.push({
      id,
      lock,
      title: (getTitle(md) || id || path).trim(),
      path,
      dir,
      output,
      outputPath: join(dir, output)
    })
  }
  return classify(list)
}

export const action = async (args: ActionArg<BundleOptions>) => {
  const rootPath = getProjectRootPath()
  const config = mergeConfig(args)
  const skipHidden = config['skip-hidden'] ? ['**/.*/**/*', '**/.*'] : []
  
  const exclude = [
    '**/node_modules/.*/*',
    '**/node_modules/**/*',
    ...skipHidden,
    ...config.exclude.map((path) => replacePath(`${rootPath}/${path}`))
  ]
  const include = config.include.map((path) => replacePath(`${rootPath}/${path}`))
  const paths = getAllFiles(rootPath, [], { include, exclude })
    .filter((path) => config.filenames.some((filename) => path.endsWith(`/${filename}`)))
  const pathDetails = getPathDetails(paths, config)
  for (const pathDetail of pathDetails) {
    if (pathDetail.lock) {
      continue
    }
    const content = replace(pathDetail, pathDetails)
    const output = pathDetail.output || config.output
    const writePath = output ? join(pathDetail.dir, output) : pathDetail.path
    writeFileSync(writePath, content, 'utf-8')
  }
}
