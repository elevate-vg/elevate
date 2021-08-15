import serve from './loader'
import environment from './init/environment'
import { createContext } from './context'
import { compose, equals, when } from 'libs/utils'

// prettier-ignore
export const main = async () => 
   compose(
      serve,
      environment, 
   )(createContext())

export default main

// Script called directly?
when(equals(require.main), main, module)
