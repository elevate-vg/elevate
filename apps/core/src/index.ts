import loader from './loader'
import setEnvs from './init/set-env'
import { createContext } from './context'
import { equals, when } from 'libs/utils'
import { initFns } from './utils'
import { setupDependencies } from './init/dependencies'
import dependencyList from './init/dependencyList'

const ctx = createContext()

export const init = initFns(ctx)(process.platform)

export const serve = () => loader(ctx)

export const main = async () => {
   setEnvs(ctx)

   setupDependencies(ctx, dependencyList(ctx))

   // prettier-ignore
   // init([
   //    setupElectron,
   //    setupChrome,
   //    setupPrisma
   // ])

   serve()
}

export default main

// Script called directly?
when(equals(require.main), main, module)
