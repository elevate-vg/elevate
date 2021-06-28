import { Plugin } from 'libs/types'

export const meta: Plugin.Meta = {
   namespace: '@simonwjackson',
   name: 'launch',
   version: '1.0.0',
}

export const themes: Plugin.Theme[] = [
   {
      name: 'theme-launch',
      directory: '.',
   },
]
