const { exec } = require('child_process')
const winston = require('winston')

module.exports = async (params)=>{
  return new Promise((resolve, reject) => {
    winston.debug(" ]]] ]]] STARTING REACT DEV SERVER...")

    exec('npm start', (err, stdout, stderr) => {
      if(err || stderr) {
        console.log(err,stderr)
        reject(err)
      } else {
        resolve("DONE")
      }
    }).stdout.pipe(process.stdout);
  })
}
