const runClevis = require('./clevis')

// function clevis(...args) {
//   console.log('in index clevis args: ', args);
//   let call = process.argv[0]
//   let path = process.argv[1] || __dirname
//
//   return runClevis(call, path, ...args)
// }

let { exec } = require('child_process')
async function clevis(...args) {
  let command = './bin.js ' + args.join(' ')

  return new Promise((resolve, reject) => {
    exec(command, function(e, out, err) {
      if(e) {
        reject(e)
      } else {
        resolve(out)
      }
    })
  })
}

module.exports = clevis
