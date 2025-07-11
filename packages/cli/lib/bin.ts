#!/usr/bin/env node

import {Command} from 'commander'
import {mkdir, readFile, writeFile, readdir} from 'fs/promises'
import {join, dirname} from 'path'
import {fileURLToPath} from 'url'
import {create} from './index.js'

const program = new Command()

program
  .name('teaui')
  .description('CLI for creating TeaUI applications')
  .version('1.2.1')

program
  .command('create')
  .description('Create a new TeaUI application')
  .argument('<name>', 'Name of the application')
  .requiredOption(
    '-f, --framework <framework> (none, react, or preact)',
    'Framework to use',
    value => {
      if (!['react', 'preact', 'none'].includes(value)) {
        throw new Error(
          `Invalid framework: ${value}. Must be one of: react, preact, none`,
        )
      }
      return value
    },
  )
  .action(async (name: string, options: {framework: string}) => {
    try {
      create(name, options)
    } catch (error) {
      console.error(`Error creating application: ${error}`)
      process.exit(1)
    }
  })

program.parse()
