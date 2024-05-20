import { getSettings, DEFAULT_MD_FILE_NAME } from '~utils/settings.js'
import { action } from '../src/cli/commands/generate/action.js'

action({ options: {}, settings: getSettings(DEFAULT_MD_FILE_NAME) }).then()