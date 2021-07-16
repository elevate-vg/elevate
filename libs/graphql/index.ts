import { types as location } from './types/location'
import { types as program } from './types/program'
import { types as modification } from './types/modification'
import { types as platform } from './types/platform'
import { types as application } from './types/application'
import { types as locale } from './types/locale'
import { types as library } from './types/library'
import { types as media } from './types/media'

export const types = [
   ...application,
   ...location,
   ...modification,
   ...platform,
   ...program,
   ...locale,
   ...library,
   ...media,
]
