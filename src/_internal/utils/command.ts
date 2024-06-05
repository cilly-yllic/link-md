import { Command as Program } from 'commander'

import { Action, BeforeFunction, ActionArg } from '~types/command.js'

type SettingsFnc<CommandOptions extends Record<string, any>, MdSettings extends Record<string, any>> = (
  options: CommandOptions
) => MdSettings

export class CommandClass<CommandOptions extends Record<string, any>, MdSettings extends Record<string, any>> {
  program!: Program
  private befores: BeforeFunction[] = []
  private args!: ActionArg<CommandOptions, MdSettings>
  private getSettingFnc: SettingsFnc<CommandOptions, MdSettings>

  constructor(program: Program, getSettingFnc: SettingsFnc<CommandOptions, MdSettings>) {
    this.program = program
    this.getSettingFnc = getSettingFnc
  }

  // async init(options: ActionArg<T>['options'], settings: Settings) {
  init(options: CommandOptions, settings: MdSettings) {
    this.args = {
      options,
      settings,
    }
    return this
  }

  command(command: string) {
    this.program = this.program.command(command).option('-d, --debug', 'turn on debugging', false)
    return this
  }

  help(helpTxt: string) {
    this.program = this.program.on('--help', () => {
      console.log()
      console.log(helpTxt)
    })
    return this
  }

  before(before: Action, ...args: any[]) {
    this.befores.push({ fn: before, args: args })
    return this
  }

  description(description: string) {
    this.program = this.program.description(description)
    return this
  }

  option(...args: any[]) {
    const flags = args.shift()
    this.program = this.program.option(flags, ...args)
    return this
  }

  requiredOption(...args: any[]) {
    const flags = args.shift()
    this.program = this.program.requiredOption(flags, ...args)
    return this
  }

  action(action: Action) {
    this.program = this.program.action(async (...args: any[]) => {
      const options = args[0] as CommandOptions
      await this.init(options, this.getSettingFnc(options))
      for (const before of this.befores) {
        await before.fn(options, ...before.args)
      }
      return action(this.args, ...args)
    })
  }
}

export const setCommands = <CommandOptions extends Record<string, any>, MdSettings extends Record<string, any>>(
  program: Program,
  commands: string[],
  initFnc: (commandClass: CommandClass<CommandOptions, MdSettings>) => void,
  getSettingFnc: SettingsFnc<CommandOptions, MdSettings>
) => {
  for (const command of commands) {
    initFnc(new CommandClass<CommandOptions, MdSettings>(program, getSettingFnc).command(command))
  }
}
