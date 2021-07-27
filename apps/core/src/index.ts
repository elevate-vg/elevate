import loader from './loader'
import setupChrome from './init/setup-chrome'
import setupElectron from './init/setup-electron'
import setupPrisma from './init/setup-prisma'
import setEnvs from './init/set-env'
import { createContext } from './context'
import { equals, when } from 'libs/utils'
import { initFns } from './utils'

const ctx = createContext()

export const init = initFns(ctx)(process.platform)

export const serve = () => loader(ctx)

export const main = async () => {
   setEnvs(ctx)

   // prettier-ignore
   init([
      setupElectron,
      setupChrome,
      setupPrisma
   ])

   serve()
}

export default main

// Script called directly?
when(equals(require.main), main, module)
