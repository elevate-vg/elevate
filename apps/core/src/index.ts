import serve from './loader'
import downloadChrome from './init/download-chrome'
import downloadElectron from './init/download-electron'
import downloadPrisma from './init/download-prisma'
import setEnvs from './init/set-env'
import { createContext } from './context'

const ctx = createContext()

setEnvs(ctx)

// TODO: Host downloads should happen in CLI
downloadChrome(process.platform)
downloadElectron(process.platform)
// prettier-ignore
downloadPrisma(process.platform).then(() => 
   serve(ctx)
)
