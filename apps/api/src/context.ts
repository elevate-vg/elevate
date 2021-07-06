import { PrismaClient } from '@prisma/client'
import expressApp, { Application } from 'express'
import puppeteer, { Puppeteer } from 'puppeteer-core'
import { join } from 'path'
import { baseDir } from './constants'
import * as axios from 'axios'
import * as cheerio from 'cheerio'

// TODO: Generate type for this monkey patch
// TODO: Refactor into separate file
const getPuppeteer = () => {
   switch (process.env.NODE_ENV) {
      case 'production': {
         switch (process.platform) {
            case 'win32': {
               // TODO: Is this the correct path
               return './bin/chrome-win/chrome.exe'
            }
            case 'darwin': {
               return './bin/chrome-mac/Chromium.app/Contents/MacOS/Chromium'
            }
         }
         break
      }
      default: {
         switch (process.platform) {
            case 'win32': {
               return join(
                  baseDir,
                  // TODO: Is this the correct path
                  './bin/chrome-win/chrome.exe',
               )
            }
            case 'darwin': {
               return join(baseDir, './bin/chrome-mac/Chromium.app/Contents/MacOS/Chromium')
            }
         }
         break
      }
   }
}

const prisma = new PrismaClient({ log: ['query'] })
const express = expressApp()
const createPuppeteer = () => {
   // @ts-ignore
   puppeteer._launch = puppeteer.launch

   // @ts-ignore
   puppeteer.launch = (opts: puppeteer.LaunchOptions) => {
      // @ts-ignore
      return puppeteer._launch({
         ...opts,
         executablePath: getPuppeteer(),
      })
   }

   return puppeteer
}

export interface Context {
   prisma: PrismaClient
   express: Application
   puppeteer: Puppeteer
   axios: axios.AxiosStatic
   cheerio: cheerio.CheerioAPI
}

export function createContext(): Context {
   return {
      prisma,
      express,
      // @ts-ignore
      puppeteer: createPuppeteer(),
      axios: axios.default,
      cheerio: cheerio.default,
   }
}
