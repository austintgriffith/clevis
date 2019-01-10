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

program.command('balance <address> [units]')
  .description('returns account balance in units (defaults to ether)')
  .action(standard)

program.command('block <blockNumber>').action(standard)
program.command('blockNumber').action(standard)
// program.command('build').action(standard)
// program.command('compile <contractName>').action(standard)
// program.command('contract <scriptName> <contractName> [accountIndex] [contractArguments]').action(standard)
// program.command('create <contractName>').action(standard)
// program.command('deploy <contractName> <accountIndex>').action(standard)
// program.command('explain <contractName>').action(standard)
// program.command('fromhex <hexString>').action(standard)
program.command('fromWei <amount> <symbol>').action(standard)


// program ALL
// program AIRDROP

program.on('command:*', () => {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '))
  process.exit(1)
})

program.on('option:debug', () => {
  winston.level = 'debug'
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

//TODO: Handle accounts in a generic way. The way that balance.js used to. It should handle index, 40 char (no 0x) and 42 char)
async function runCmd(name, args) {
  winston.debug(`🗜️ Clevis [${name}]`)
  winston.debug(`${name.toUpperCase()}`)

  let config = readConfig()

  let params = {
    web3: new Web3(new Web3.providers.HttpProvider(config.provider))
  }

  console.log(await require(`./commands/${name}.js`)(...args, params))
}

function readConfig() {
  return JSON.parse(fs.readFileSync("clevis.json").toString())
}
