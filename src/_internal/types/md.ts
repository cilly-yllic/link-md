export const PROPERTIES = {
  CONFIG: 'CONFIG',
  LINK_NEXT_LINE: 'LINK_NEXT_LINE',
  BEGIN_LINKS: 'BEGIN_LINKS',
  END_LINKS: 'END_LINKS',
  BEGIN_DEFINE_LINKS: 'BEGIN_DEFINE_LINKS',
  END_DEFINE_LINKS: 'END_DEFINE_LINKS',
  BEFORE_GENERATE_LINK: 'BEFORE_GENERATE_LINK',
}

export interface PathInfo {
  id: string
  lock: boolean
  title: string
  path: string
  dir: string
  output: string
  outputPath: string
}

export interface PathDepthClassify {
  children: string[]
  grandchildren: string[]
  parallels: string[]
}

export interface Detail extends PathInfo, PathDepthClassify {}

// export interface DetailMap {
//   [path: string]: Detail
// }

export interface LinkNextLineProperties {
  id: string
  inline: true
}

export interface EndLinksProperties {
  all: boolean
  linked: boolean
  child: boolean
  grandChild: boolean
  parallel: boolean
}

export const LINK_NAME_PREFIX = 'link_md:'
export const BEGIN_COMMENT = '<!--'
export const END_COMMENT = '-->'
export const PARAM_SEPARATOR = ':'
export const LINK_MD_COMMENT_PREFIX = 'LINK_MD'
export const COMMENT_REG_EXP = new RegExp(`${BEGIN_COMMENT}\\s*.*?${END_COMMENT}`, 'gs')
export const BRAKE_LINE_REG_EXP = new RegExp(/\r?\n/, 'g')
export const LINK_REG_EXP = new RegExp('^\\s*.*\\[(.+)][(|\\[](.+)[)|\\]].*')
export const LINK_MD_COMMENT_PREFIX_REG_EXP = new RegExp(
  `${BEGIN_COMMENT}\\s*${LINK_MD_COMMENT_PREFIX}${PARAM_SEPARATOR}\\s*`
)
// export const LINK_MD_PARAMS_REG_EXP = new RegExp(`^\\w+${PARAM_SEPARATOR}(.*?)${END_COMMENT}.*`, 's')
export const LINK_MD_PARAMS_REG_EXP = new RegExp(`^[^${PARAM_SEPARATOR}]+${PARAM_SEPARATOR}(.*?)${END_COMMENT}.*`, 's')
// export const LINK_MD_CONTENT_REG_EXP = new RegExp(`^\\w+${PARAM_SEPARATOR}.*${END_COMMENT}(.*)`, 's')
export const LINK_MD_CONTENT_REG_EXP = new RegExp(`^[^${PARAM_SEPARATOR}]+${PARAM_SEPARATOR}.*${END_COMMENT}(.*)`, 's')
// export const LINK_MD_PROPERTY_REG_EXP = new RegExp(`^(\\w+?)${PARAM_SEPARATOR}.*`, 's')
export const LINK_MD_PROPERTY_REG_EXP = new RegExp(`^([^${PARAM_SEPARATOR}]+?)${PARAM_SEPARATOR}.*`, 's')
