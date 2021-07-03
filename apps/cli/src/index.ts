#!/usr/bin/env node
import yargs from 'yargs/yargs'
import { hideBin } from 'yargs/helpers'

// Commands
import * as serve from './serve'

yargs(hideBin(process.argv))
   .command({ ...serve })
   .option('verbose', {
      alias: 'v',
      default: true,
      type: 'boolean',
      description: 'Run with verbose logging',
   })
   .demandCommand()
   .help()
   .strict()
   .recommendCommands().argv
