import { CommandOptions, MdSettings } from '~types/configs/links.js'
import { CommandClass } from '~utils/command.js'
import { getSettings as _getSettings } from '~utils/link.js'
import { getCommands } from '~utils/path.js'

import { action } from './action.js'

export const COMMANDS = getCommands(import.meta.dirname)

export const init = (commandClass: CommandClass<CommandOptions, MdSettings>) => {
  commandClass
    .description('This command is used to exec target file.')
    .option('-sh --skip-hidden', 'skip read hidden dir (default: true)')
    .option('-incl, --include <strings>', 'include dirs (default: [] (all files))')
    .option('-excl, --exclude <strings>', 'ignore dirs (default: node_modules only)')
    .option('-f, --filenames <strings>', 'filenames (default: README.md only)')
    .option('-o, --output <filename>', 'output filename (default: README.md (replace))')
    .option('-i, --input <filename>', 'target root filename (default: README.md)')
    .option('-D, --depth <filename>', 'depth level more than 0')
    .action(options => {
      return action(options)
    })
}

export const getSettings = (options: CommandOptions): MdSettings => {
  return _getSettings(options.input || '')
}
