import { readdirSync, statSync } from 'fs'

const getDirectories = (dir, _files = []) => {
  const files = readdirSync(dir)
  for (const file of files) {
    const name = `${dir}/${file}`
    _files.push(dir)
    if (statSync(name).isDirectory()) {
      getDirectories(name, _files)
    }
  }
  return _files
}

export const isParent = (thisPath, isParentThisPath) => {
  const isParentThisPaths = isParentThisPath.split('/')
  isParentThisPaths.pop()
  const stack = []
  for (const path of isParentThisPaths) {
    stack.push(path)
    if (thisPath !== isParentThisPath && thisPath === stack.join('/')) {
      return true
    }
  }
  return false
}

export const isFirstChild = (thisPath, isFirstChildThisPath) => {
  const thisPaths = thisPath.split('/')
  thisPaths.pop()
  return thisPath !== isFirstChildThisPath && thisPaths.join('/') === isFirstChildThisPath
}

export const isDeepChild = (thisPath, isDeepChildThisPath) => {
  const thisPaths = thisPath.split('/')
  const stack = []
  for (const path of thisPaths) {
    stack.push(path)
    if (isDeepChildThisPath === stack.join('/')) {
      return true
    }
  }
  return false
}

export const getTargetPaths = (filePath, dirs) => {
  const paths = []
  for (const path of dirs) {
    if (path === filePath || isParent(path, filePath)) {
      continue
    }
    if (isDeepChild(path, filePath) && !isFirstChild(path, filePath)) {
      continue
    }
    if (filePath.startsWith('./src/_internal/types')) {
      continue
    }
    paths.push(path)
  }
  return getOnlyShallows(paths)
}

export const getOnlyShallows = dirs => {
  const stack = []
  for (const path of dirs) {
    if (dirs.some(d => d !== path && isDeepChild(path, d))) {
      continue
    }
    stack.push(path)
  }
  return stack
}

export const getRules = () => {
  const dirs = [...new Set(getDirectories('./src/_internal'))]
  const zones = []
  for (const from of dirs) {
    zones.push({
      from: `${from}/*`,
      target: ['./src/core', ...getTargetPaths(from, dirs)],
      message: `${from}直下のファイルをインポートする際は同階層のファイルか親階層のファイルからしかインポートできません。例外としてsrc/modules内からは可能です。`,
    })
  }
  return zones
}
