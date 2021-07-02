import serve from './loader'
import downloadChrome from './init/download-chrome'
import setEnvs from './init/set-env'
import { createContext } from './context'

setEnvs()
downloadChrome(process.platform)
serve(createContext())
