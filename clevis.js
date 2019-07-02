const Command = require('commander').Command
const fs = require('fs')
const Web3 = require('web3')
const winston = require('winston')
require('./initLogger')()
require('dotenv').config()

async function execute(name, ...args) {
  winston.debug(`🗜️ Clevis [${name}]`)
  winston.debug(`${name.toUpperCase()}`)

  let config = readConfig()
  let provider = getWeb3Provider(name, config)
  let web3 = new Web3(provider)

  let params = {
    config: config,
    web3: web3
  }

  let fn = require(`./commands/${name}.js`)

  try {
    let result = fn(...args, params)

    if(web3.currentProvider.engine) {
      params.web3.currentProvider.engine.stop()
    }

    return result
  } catch(e) {
    winston.error(e)
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


//Usage: new Runner().runCommand(process.argv)
class Runner {
  constructor() {
    this.program = this.setupProgram()
  }

  runCommand(args) {
    let p = new Promise((resolve, reject) => {
      this.resolve = resolve
      this.reject = reject
    })

    this.program.parse(args)

    if(this.program.args.length == 0) {
      this.program.help()
    }

    return p
  }

  async standard(...args) {
    let cmdr = args.pop()
    let name = cmdr.name()

    execute(name, ...args).then(result => {
      this.resolve(result)
    }).catch(e => {
      this.reject(e)
    })
  }

  setupProgram() {
    let standard = this.standard.bind(this)

    let program = new Command()

    program
    .option('--debug', 'Turns on Debugging output')

    program
      .version('0.1.0')

    program.command('accounts').action(standard)
    program.command('balance <address> [units]').action(standard)
    program.command('block <blockNumber>').action(standard)
    program.command('blockNumber').action(standard)
    program.command('build').action(standard)
    program.command('compile <contractName> [proxyContractName]').action(standard) //proxyContractName lets you add to the abi for proxy patterns 
    program.command('contract <scriptName> <contractName> [accountIndex] [contractArguments...]').action(standard)
    program.command('create <contractName>').action(standard)
    program.command('deploy <contractName> <accountIndex> [deployArguments...]').action(standard)
    program.command('explain <contractName>').action(standard)
    program.command('fromhex <hexString>').action(standard)
    program.command('fromwei <amount> <symbol>').action(standard)
    program.command('init').action(init)
    program.command('invalidate <target>').action(standard)
    program.command('new [password]').action(standard)
    program.command('randomhex <size>').action(standard)
    program.command('recover <string> <signature>').action(standard)
    program.command('send <amount> <fromAddress> <toAddress> [data]').action(standard)
    program.command('sha3 <string>').action(standard)
    program.command('sign <string> <accountIndex> <password>').action(standard)
    program.command('start').action(standard)
    program.command('test <testName>').action(standard)
    program.command('tohex <textString>').action(standard)
    program.command('towei <amount> <symbol>').action(standard)
    program.command('transaction <hash>').action(standard)
    program.command('unlock <accountIndex> <password>').action(standard)
    program.command('update').action(standard)
    program.command('upload <site>').action(standard)
    program.command('version').action(standard)

    program.on('command:*', () => {
      console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '))
      process.exit(1)
    })

    program.on('option:debug', () => {
      winston.level = 'debug'
    })

    return program
  }
}

module.exports = {
  Runner
}
