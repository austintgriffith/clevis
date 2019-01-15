#! /usr/bin/env node
const { setupProgram } = require('./clevis.js')

const program = setupProgram()
program.parse(process.argv)

if(program.args.length == 0) {
  program.help()
}
