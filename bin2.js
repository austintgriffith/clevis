#! /usr/bin/env node
const program = require('commander');
const winston = require('winston');
require('./initLogger')()

program
  .option('--debug', 'Turns on Debugging output')

program
  .version('0.1.0')

program.command('fromWei2 <amount> <symbol>').action(standard);

program.on('command:*', () => {
  console.error('Invalid command: %s\nSee --help for a list of available commands.', program.args.join(' '));
  process.exit(1);
});

program.parse(process.argv)
if(program.args.length == 0) {
  program.help();
}

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

  console.log(require(`./commands/${name}.js`)(...args, params))
}
