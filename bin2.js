#! /usr/bin/env node
const program = require('commander');
const winston = require('winston');
configureLogger();

program
  .option('--debug', 'Turns on Debugging output')

program
  .version('0.1.0')

program.command('fromWei2 <amount> <symbol>').action(standard);

// program
//   .command('airdrop')
//   .description('Drop ETH or ERC20 tokens onto many accounts.')
//   .option('-f, --from-index <fromIndex>', "The local clevis account index to send funds from.")
//   .option('-d, --dryrun', 'Prints out what will be done without actually sending transactions.')
//   .action(standard);

program.parse(process.argv)


//Default handler when no extra logic is required
function standard(...args) {
  let cmdr = args.pop()
  let name = cmdr.name()

  if(cmdr.parent.debug) {
    winston.level = 'debug'
    winston.debug("Debug level logging set.")
  }

  runCmd(name, args);
}

function runCmd(name, args) {
  winston.debug("🗜️ Clevis ["+name+"]");

  let params = {
    config: {
    },
    web3: require('web3')
  }

  let result = require(`./commands/${name}.js`)(...args, params);
  console.log(result);
}

//TODO: Can take this out of this file as long as its called once
function configureLogger() {
  winston.addColors({debug: 'magenta'});
  winston.configure({
    level: 'info',
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    ),
    transports: [
      new winston.transports.Console()
    ]
  });
}
