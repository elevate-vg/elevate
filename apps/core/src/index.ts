import serve from './loader'
import environment from './init/environment'
import { createContext } from './context'
import { compose, equals, when } from 'libs/utils'
import dependencies from './init/dependencies'

// prettier-ignore
export const main = async () => 
   compose(
      serve,
      dependencies,
      environment, 
   )(createContext())

export default main

// Script called directly?
when(equals(require.main), main, module)
