#! /usr/bin/env node
const { Runner } = require('./clevis')

async function run() {
  let runner = new Runner()
  console.log(await runner.runCommand(process.argv))
}

run()
