import { Command as Program } from 'commander'

import { HelpOptions } from '~types/options.js'
import { CommandClass } from '~utils/command.js'

import { action } from './action.js'

const BASE_COMMAND = 'help'

const setAliases = (commandClass: CommandClass<HelpOptions>) => {
  commandClass.description('This command is used to show help').action(BASE_COMMAND, options => {
    return action(options)
  })
}

const commands = [BASE_COMMAND, 'h']

export const init = (program: Program) => {
  for (const command of commands) {
    setAliases(new CommandClass<HelpOptions>(program).command(command))
  }
}
