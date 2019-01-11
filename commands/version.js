const fs = require('fs')

module.exports = (params)=>{
  let pkg = JSON.parse(fs.readFileSync(__dirname + "/../package.json").toString())

  return {
    clevis: pkg.version,
    web3: params.web3.version,
  }
}
