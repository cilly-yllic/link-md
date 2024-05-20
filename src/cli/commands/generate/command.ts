import { Command as Program } from 'commander'


import { BundleOptions } from '~types/options.js'
import { CommandClass } from '~utils/command.js'

import { action } from './action.js'


const setAliases = (commandClass: CommandClass<BundleOptions>) => {
  commandClass
    .description('This command is used to exec target file.')
    .option('-sh --skip-hidden <boolean>', 'skip read hidden dir, default: true')
    .option('-incl, --include <strings>', 'include dirs, default: [] (all files)')
    .option('-excl, --exclude <strings>', 'ignore dirs, default: node_modules only')
    .option('-f, --filenames <strings>', 'filenames, default: README.md only')
    .option('-o, --output <filename>', 'output filename. default: README.md (replace)')
    .option('-i, --input <filename>', 'target root filename, default: README.md')
    .action(options => {
      return action(options)
    })
}

const commands = ['generate', 'g']

export const init = (program: Program) => {
  for (const command of commands) {
    setAliases(new CommandClass<BundleOptions>(program).command(command))
  }
}
