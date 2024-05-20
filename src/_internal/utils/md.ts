import { readFileSync } from 'fs'

import {
  Detail,
  LinkNextLineProperties,
  EndLinksProperties,
  PROPERTIES,
  LINK_NAME_PREFIX,
  COMMENT_REG_EXP,
  PARAM_SEPARATOR,
  LINK_REG_EXP,
  LINK_MD_COMMENT_PREFIX,
  LINK_MD_COMMENT_PREFIX_REG_EXP,
  LINK_MD_PROPERTY_REG_EXP,
  LINK_MD_PARAMS_REG_EXP,
  BRAKE_LINE_REG_EXP,
  LINK_MD_CONTENT_REG_EXP,
  BEGIN_COMMENT,
  END_COMMENT,
} from '~types/md.js'

import { getRelative } from './path.js'
import { isBoolean } from './type-check.js'

export const getParam = (text: string, key: string) => {
  const PREFIX = `${BEGIN_COMMENT}\\s*${LINK_MD_COMMENT_PREFIX}:\\s*${key}:`
  const reg = new RegExp(`${PREFIX}(.*?)${END_COMMENT}`, 's')
  if (!reg.test(text)) {
    return ''
  }
  return (reg.exec(text) as RegExpExecArray)[1]
}

export const getParams = (text: string, key: string) => {
  const PREFIX = `${BEGIN_COMMENT}\\s*${LINK_MD_COMMENT_PREFIX}:\\s*${key}:`
  const reg = new RegExp(`${PREFIX}(.*?)${END_COMMENT}`, 'gs')
  if (!reg.test(text)) {
    return ''
  }

  return text.match(reg) as RegExpMatchArray
}

const getRemovedCommentOut = (text: string) => text.replace(COMMENT_REG_EXP, '')

const getFirstLine = (text: string) => {
  const lines = text.split('\n').filter(line => line.trim().length)
  return lines.length ? lines[0].trim() : ''
}

export const getTitle = (text: string) => {
  const title = getParam(text, 'TITLE')
  if (title) {
    return title
  }
  const md = getRemovedCommentOut(text)
  return getParam(text, 'TITLE') || md.replace(/\r?\n?#+(.*?)\r?\n.*/s, '$1').trim() || getFirstLine(md)
}

type DefineLinkName = `${typeof LINK_NAME_PREFIX}${string}`
const getLinkName = (id: string): DefineLinkName => `${LINK_NAME_PREFIX}${id}`
const getLink = (id: string, title: string) => `[${title}][${getLinkName(id)}]`
const getLinksByDetails = (details: Detail[]): string[] => details.map(d => getLink(d.id, d.title))

type DefineLinkKey = `[${DefineLinkName}]${typeof PARAM_SEPARATOR}`
type DefineLinkBase = `${DefineLinkKey} ${string}`
type DefineLink = DefineLinkBase | `${DefineLinkBase} '${string}'`
const getDefineLink = (id: string, url: string, title: string): DefineLink =>
  `[${getLinkName(id)}]: ${url}${title ? ` '${title}'` : ''}`

const replaceToLink = (txt: string, inline: boolean, detail: Detail) => {
  if (LINK_REG_EXP.test(txt)) {
    const url = txt.replace(LINK_REG_EXP, '$2')
    if (url === getLinkName(detail.id)) {
      return txt
    }
    // TODO keep list block
    return `[${txt.replace(LINK_REG_EXP, '$1')}][${getLinkName(detail.id)}]
<!-- ${LINK_MD_COMMENT_PREFIX}${PARAM_SEPARATOR} ${PROPERTIES.BEFORE_GENERATE_LINK}${PARAM_SEPARATOR} -->
<!-- ${txt} -->
`
  }
  if (inline) {
    // TODO keep list block
    return `[${txt}][${getLinkName(detail.id)}]`
  } else {
    return `[${detail.title}][${getLinkName(detail.id)}]
${txt}
`
  }
}

const getLinkContent = (path: string, content: string, { id, inline }: LinkNextLineProperties, details: Detail[]) => {
  const data = details.find(d => d.path !== path && d.id === id)
  if (!data) {
    return content
  }
  const splits = content.split('\n')
  const lines = []
  let firstLine = false
  for (const split of splits) {
    if (split.trim().length && !firstLine) {
      firstLine = true
      lines.push(replaceToLink(split, inline, data))
      continue
    }
    lines.push(split)
  }
  return lines.join('\n')
}

interface SectionParams {
  params: Record<string, any>
  content: string
}

const getSectionParams = (section: string): SectionParams => {
  const params = section.replace(LINK_MD_PARAMS_REG_EXP, '$1')
  const splits = params
    .split(BRAKE_LINE_REG_EXP)
    .filter(p => p.trim().length) as `${string}${typeof PARAM_SEPARATOR}${string}`[]
  return {
    params: splits.reduce((acc: Record<string, any>, keyValueText) => {
      const keyValue = keyValueText.split(PARAM_SEPARATOR).map(k => k.trim())
      if (keyValue.length !== 2) {
        return acc
      }
      acc[keyValue[0]] = isBoolean(keyValue[1]) ? JSON.parse(keyValue[1]) : keyValue[1]
      return acc
    }, {}),
    content: section.replace(LINK_MD_CONTENT_REG_EXP, '$1'),
  }
}

const getRelateDetails = (details: Detail[], list: string[]) => details.filter(d => list.includes(d.path))

const push = (list: any[], stack: any[] = []) => {
  for (const data of list) {
    stack.push(data)
  }
}

const getLinksByProperties = (detail: Detail, properties: EndLinksProperties, details: Detail[]) => {
  if (properties.all) {
    return details.filter(d => d.path !== detail.path)
  }
  const links: Detail[] = []
  if (properties.parallel) {
    push(getRelateDetails(details, detail.parallels), links)
  }
  if (properties.child) {
    push(getRelateDetails(details, detail.children), links)
  }
  if (properties.grandChild) {
    push(getRelateDetails(details, detail.grandchildren), links)
  }
  return links
}

const getLinksContent = (properties: EndLinksProperties, linksDetails: Detail[], lineLinkDetails: Detail[]) => {
  let list: Detail[] = linksDetails
  if (!properties.linked) {
    list = linksDetails.filter(d => lineLinkDetails.every(lineLinkDetail => lineLinkDetail.path !== d.path))
  }
  return `\n${getLinksByDetails(list).join('\n')}\n`
}

const rebaseCommentSection = (property: string, params: Record<string, any>) => {
  if (!Object.keys(params).length) {
    return `${property}: ${END_COMMENT}`
  }
  return `${property}:\n${Object.entries(params)
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n')}\n${END_COMMENT}`
}

const getSectionByContent = (property: string, params: Record<string, any>, content: string) => {
  return `${rebaseCommentSection(property, params)}${content}`
}

const getValidate = (detail: Detail, sections: string[], details: Detail[]) => {
  let hasEndLinksSection = false
  let hasBeginDefineLinksSection = false
  let hasEndDefineLinksSection = false
  let linksDetails: Detail[] = []
  const lineLinksDetails: Detail[] = []
  for (const section of sections) {
    const property = section.replace(LINK_MD_PROPERTY_REG_EXP, '$1')
    switch (property) {
      case PROPERTIES.LINK_NEXT_LINE: {
        const { params } = getSectionParams(section)
        const data = details.find(d => d.path !== detail.path && d.id === params.id)
        if (data) {
          lineLinksDetails.push(data)
        }
        break
      }
      case PROPERTIES.BEGIN_LINKS:
        linksDetails = getLinksByProperties(detail, getSectionParams(section).params as EndLinksProperties, details)
        break
      case PROPERTIES.END_LINKS:
        hasEndLinksSection = true
        break
      case PROPERTIES.BEGIN_DEFINE_LINKS:
        hasBeginDefineLinksSection = true
        break
      case PROPERTIES.END_DEFINE_LINKS:
        hasEndDefineLinksSection = true
        break
    }
  }
  return {
    hasEndLinksSection,
    hasBeginDefineLinksSection,
    hasEndDefineLinksSection,
    linksDetails,
    lineLinksDetails,
  }
}

interface DefineMap {
  [path: string]: DefineLink
}

const setDefineLinks = (currentDir: string, details: Detail[], defineMap: DefineMap = {}) => {
  for (const { id, title, outputPath } of details) {
    let url = getRelative(currentDir, outputPath)
    if (!/^\.*\//.test(url)) {
      url = `./${url}`
    }
    defineMap[outputPath] = getDefineLink(id, url, title)
  }
}

const getDefineLinksContent = (
  dir: string,
  linksDetails: Detail[],
  lineLinkDetails: Detail[],
  hasEndDefineLinksSection: boolean
) => {
  const defineMap: DefineMap = {}
  setDefineLinks(dir, linksDetails, defineMap)
  setDefineLinks(dir, lineLinkDetails, defineMap)
  let content = `\n${Object.values(defineMap).join('\n')}\n`
  if (!hasEndDefineLinksSection) {
    content += `${BEGIN_COMMENT} ${LINK_MD_COMMENT_PREFIX}${PARAM_SEPARATOR} ${PROPERTIES.END_DEFINE_LINKS}${PARAM_SEPARATOR} ${END_COMMENT}\n`
  }
  return content
}

export const replace = (detail: Detail, details: Detail[]) => {
  const md = readFileSync(detail.path, 'utf-8')
  const _sections = md.split(LINK_MD_COMMENT_PREFIX_REG_EXP)
  const sections: string[] = []
  let i = -1
  const { hasEndLinksSection, hasBeginDefineLinksSection, hasEndDefineLinksSection, linksDetails, lineLinksDetails } =
    getValidate(detail, _sections, details)
  for (const _section of _sections) {
    ++i
    if (i === 0) {
      sections.push(_section)
      continue
    }
    const property = _section.replace(LINK_MD_PROPERTY_REG_EXP, '$1')
    const { params, content: _content } = getSectionParams(_section)
    let content = _content
    let section = _section
    switch (property) {
      case PROPERTIES.LINK_NEXT_LINE:
        content = getLinkContent(detail.path, _content, params as LinkNextLineProperties, details)
        section = getSectionByContent(property, params, content)
        break
      case PROPERTIES.BEGIN_LINKS:
        content = getLinksContent(params as EndLinksProperties, linksDetails, lineLinksDetails)
        section = getSectionByContent(property, params, content)
        if (!hasEndLinksSection) {
          section += `\n${BEGIN_COMMENT} ${LINK_MD_COMMENT_PREFIX}${PARAM_SEPARATOR} ${PROPERTIES.END_LINKS}${PARAM_SEPARATOR} ${END_COMMENT}`
        }
        break
      case PROPERTIES.BEGIN_DEFINE_LINKS:
        section = getSectionByContent(
          property,
          params,
          getDefineLinksContent(detail.dir, linksDetails, lineLinksDetails, hasEndDefineLinksSection)
        )
        break
      default:
        break
    }
    sections.push(section)
  }
  if (!hasBeginDefineLinksSection) {
    sections.push(
      getSectionByContent(
        PROPERTIES.BEGIN_DEFINE_LINKS,
        {},
        getDefineLinksContent(detail.dir, linksDetails, lineLinksDetails, hasEndDefineLinksSection)
      )
    )
  }
  return sections.join(`${BEGIN_COMMENT} ${LINK_MD_COMMENT_PREFIX}${PARAM_SEPARATOR} `)
}
