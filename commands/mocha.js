const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

module.exports = async (params)=>{
  exec('npm install -g mocha', (err, stdout, stderr) => {
    exec('clevis update', (err, stdout, stderr) => {}).stdout.on('data', function(data) {
        console.log(data);
    })
  }).stdout.on('data', function(data) {
      console.log(data);
  })
  return "Updating Mocha and current gas/eth prices..."
}
