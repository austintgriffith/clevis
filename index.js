const { Runner } = require('./clevis')

async function clevis(...args) {
  let runner = new Runner()
  return runner.runCommand(['fakefirst', 'fakepath', ...args])
}

module.exports = clevis
