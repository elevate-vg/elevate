import type { Curry } from 'Function/Curry'
import type { PrismaClient } from '@prisma/client'
import * as axios from 'axios'
import * as cheerio from 'cheerio'
import envPaths from 'env-paths'
import expressApp, { Application } from 'express'
import prisma from './prisma'
import puppeteer from './puppeteer'
import logger from './logger'
import { Puppeteer } from 'puppeteer-core'

const paths = envPaths('elevate', {
   suffix: '',
})

const express = expressApp()

export type logger = (message: string) => void
export type tappedLogger = Curry<(message: string, value: unknown) => unknown>

export interface Context {
   paths: {
      data: string
      config: string
      cache: string
      log: string
      temp: string
   }
   prisma: PrismaClient
   express: Application
   puppeteer: Puppeteer
   axios: axios.AxiosStatic
   cheerio: cheerio.CheerioAPI
   logger: {
      error: logger
      warn: logger
      info: logger
      http: logger
      verbose: logger
      debug: logger
      silly: logger
      tap: {
         error: tappedLogger
         warn: tappedLogger
         info: tappedLogger
         http: tappedLogger
         verbose: tappedLogger
         debug: tappedLogger
         silly: tappedLogger
      }
   }
}

export function createContext(): Context {
   return {
      paths,
      prisma,
      express,
      puppeteer,
      axios: axios.default,
      cheerio: cheerio.default,
      logger: logger(paths.log),
   }
}
