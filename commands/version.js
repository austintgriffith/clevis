const fs = require("fs")
module.exports = (params)=>{
  let pkg = "0.0.0"
  try{
    pkg = JSON.parse(fs.readFileSync(__dirname+"/../package.json").toString())
  }catch(e){console.log(e)}
  console.log("Clevis: "+pkg.version)
  console.log("Web3: "+params.web3.version)
}
