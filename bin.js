#! /usr/bin/env node
const fs = require('fs')
const program = require('commander')
const Web3 = require('web3')
const winston = require('winston')
require('./initLogger')()
require('dotenv').config()

program
  .option('--debug', 'Turns on Debugging output')
  .option('--config', 'Use a different configuration file')

program
  .version('0.1.0')

program.command('accounts').action(standard)
program.command('balance <address> [units]').action(standard)
program.command('block <blockNumber>').action(standard)
program.command('blockNumber').action(standard)
program.command('build').action(standard)

//NOTE: Austin, please test this in your main projects to make sure it still works.
//I did a little bit of cleanup of that file, just to work with the named vars and logging.
program.command('compile <contractName>').action(standard)

//NOTE: This one is a pretty big doozy. We shouldn't be coupling the
//clevis argument order with the generated scripts in contracts/contractName/.clevis
//I think I got around this and everythign is still 100% backward compatible
//But we should change this for sure
program.command('contract <scriptName> <contractName> [accountIndex] [contractArguments...]').action(standard)
program.command('create <contractName>').action(standard)
program.command('deploy <contractName> <accountIndex>').action(standard)
program.command('explain <contractName>').action(standard)
program.command('fromhex <hexString>').action(standard)
program.command('fromwei <amount> <symbol>').action(standard)

program.command('init').action(init)

//TODO: Cant test this one due to lack of aws credentials
program.command('invalidate <target>').action(standard)
program.command('new [password]').action(standard)
program.command('randomhex <size>').action(standard)
program.command('recover <string> <signature>').action(standard)
program.command('send <amount> <fromIndex> <toIndex> [data]').action(standard)
program.command('sha3 <string>').action(standard)
program.command('sign <string> <accountIndex> <password>').action(standard)
program.command('start').action(standard)
program.command('test <testName>').action(standard)
program.command('tohex <textString>').action(standard)
program.command('towei <amount> <symbol>').action(standard)
program.command('transaction <hash>').action(standard)
program.command('unlock <accountIndex> <password>').action(standard)
program.command('update').action(standard)
//TODO: Cant test this one due to lack of aws credentials
program.command('upload <site>').action(standard)
program.command('version').action(standard)

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
  let provider = getWeb3Provider(name, config)
  let web3 = new Web3(provider)

  let params = {
    config: config,
    web3: web3
  }

  try {
    console.log(await require(`./commands/${name}.js`)(...args, params))
  } catch(e) {
    winston.error(e)
  }

  if(web3.currentProvider.engine) {
    params.web3.currentProvider.engine.stop()
  }
}

function getWeb3Provider(name, config) {
  //If the user is using infura, they need to have a mnemonic defined
  if(name !== 'new' && config.USE_INFURA && !process.env.mnemonic) {
    winston.error("ERROR: No Mnemonic Generated. In order to use Infura, you need one. Run 'clevis new' to create a local account.")
    process.exit(1)
  }

  if(config.USE_INFURA) {
    const HDWalletProvider = require("truffle-hdwallet-provider")
    return new HDWalletProvider(
      process.env.mnemonic,
      config.provider
    )
  } else {
    return new Web3.providers.HttpProvider(config.provider)
  }
}

function readConfig() {
  return JSON.parse(fs.readFileSync("clevis.json").toString())
}

async function init() {
  console.log(await require(`./commands/init.js`)())
}
