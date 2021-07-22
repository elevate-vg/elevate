import loader from './loader'
import downloadChrome from './init/download-chrome'
import downloadElectron from './init/download-electron'
import setEnvs from './init/set-env'
import { createContext } from './context'
import { equals, when, __ } from 'libs/utils'
import { initFns } from './utils'

const ctx = createContext()

export const init = initFns(ctx)(process.platform)

export const serve = () => loader(ctx)

export const main = () => {
   setEnvs(ctx)

   // prettier-ignore
   init([
      downloadElectron, 
      downloadChrome
   ])

   serve()
}

export default main

// Script called directly?
when(equals(require.main), main, module)
