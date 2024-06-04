import { Command as Program } from 'commander'

import { setCommands } from '~utils/command.js'

const initCommand = async (filename: string, program: Program) => {
  const { COMMANDS, init, getSettings } = await import(`./${filename}/command.js`)

  setCommands(program, COMMANDS, init, getSettings)
}
export const init = async (program: Program) => {
  await initCommand('generate', program)
  await initCommand('help', program)
  await initCommand('link', program)
}
