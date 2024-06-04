import { DEFAULT_MD_FILENAME } from '~utils/configs.js'
import { getSettings } from '~utils/link.js'

import { action } from '../src/cli/commands/link/action.js'

action({ options: {}, settings: getSettings(DEFAULT_MD_FILENAME) }).then()
