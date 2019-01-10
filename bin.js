#! /usr/bin/env node
const fs = require('fs')
const program = require('commander')
const Web3 = require('web3')
const winston = require('winston')
require('./initLogger')()

program
  .option('--debug', 'Turns on Debugging output')
  .option('--config', 'Use a different configuration file')

program
  .version('0.1.0')

program.command('accounts').action(standard)
program.command('fromWei <amount> <symbol>').action(standard)

program.on('command:*', () => {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '))
  process.exit(1)
})

program.on('option:debug', () => {
  winston.level = 'debug'
  winston.debug("Debug level logging set.")
})

program.parse(process.argv)
if(program.args.length == 0) {
  program.help()
}

//Default handler when no extra logic is required
function standard(...args) {
  let cmdr = args.pop()
  let name = cmdr.name()

  runCmd(name, args)
}

async function runCmd(name, args) {
  winston.debug("🗜️ Clevis ["+name+"]")

  let config = readConfig()

  let params = {
    web3: new Web3(new Web3.providers.HttpProvider(config.provider))
  }

  let result = await require(`./commands/${name}.js`)(...args, params)
  console.log(result)
}

function readConfig() {
  return JSON.parse(fs.readFileSync("clevis.json").toString())
}
