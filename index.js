const runClevis = require('./clevis')

let { exec } = require('child_process')
async function clevis(...args) {
  let command = __dirname + '/bin.js ' + args.join(' ')

  return new Promise((resolve, reject) => {
    exec(command, function(e, out, err) {
      if(e) {
        reject(e)
      } else {
        resolve(out.trim())
      }
    })
  })
}

module.exports = clevis
