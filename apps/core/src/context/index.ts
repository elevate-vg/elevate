import type { PrismaClient } from '@prisma/client'
import * as axios from 'axios'
import * as cheerio from 'cheerio'
import envPaths from 'env-paths'
import expressApp, { Application } from 'express'
import prisma from './prisma'
import puppeteer from './puppeteer'
import logger, { Logger } from './logger'
import { Puppeteer } from 'puppeteer-core'

const paths = envPaths('elevate', {
   suffix: '',
})

const express = expressApp()

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
   logger: Logger
   platform: NodeJS.Platform
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
      platform: process.platform,
   }
}
