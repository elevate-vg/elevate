import { types as location } from './types/location'
import { types as program } from './types/program'
import { types as modification } from './types/modification'
import { types as platform } from './types/platform'
import { types as application } from './types/application'

export const types = [...application, ...location, ...modification, ...platform, ...program]
