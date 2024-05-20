import { platform } from 'node:process'

import { ActionArg } from '~types/command.js'
import { HelpOptions } from '~types/options.js'
import { info } from '~utils/log.js'
import { get, ENVS } from '~utils/process.js'

const ASCII_ART = `
 
 _       _   __   _   _   _             ___  ___   _____
| |     | | |  \\ | | | | / /           /   |/   | |  _  \\
| |     | | |   \\| | | |/ /           / /|   /| | | | | |
| |     | | | |\\   | | |\\ \\          / / |__/ | | | | | |
| |___  | | | | \\  | | | \\ \\        / /       | | | |_| |
|_____| |_| |_|  \\_| |_|  \\_\\      /_/        |_| |_____/

`

const VERSIONS = `
  Link MD: ${get(ENVS.PACKAGE_VERSION)}
  Node: ${process.versions.node}
  OS: ${platform} ${process.arch}
  `

const show = () => {
  info(ASCII_ART)
  info(VERSIONS)
}

export const action = async (_: ActionArg<HelpOptions>) => {
  show()
  // TODO
  return
}
