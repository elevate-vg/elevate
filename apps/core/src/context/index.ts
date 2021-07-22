import type { PrismaClient } from '@prisma/client'
import * as axios from 'axios'
import * as cheerio from 'cheerio'
import envPaths from 'env-paths'
import expressApp, { Application } from 'express'
import prisma from './prisma'
import puppeteer from './puppeteer'
import logger from './logger'
import { Puppeteer } from 'puppeteer-core'
import type winston from 'winston'

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
   logger: winston.Logger
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
