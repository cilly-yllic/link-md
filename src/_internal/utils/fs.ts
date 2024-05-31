import { readFileSync } from 'fs'

import { isJson } from 'my-gadgetry/type-check'

export { getAllFiles } from 'my-gadgetry/fs'

export const readJsonFileSync = (path: string, encode: BufferEncoding = 'utf-8') => {
  const json = isJson(readFileSync(path, encode))
  if (!json) {
    return {}
  }
  return json
}
