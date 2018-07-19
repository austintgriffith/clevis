const fs = require('fs')
module.exports = (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> CREATE")
  let contract = params.fs.readFileSync(__dirname+"/../templates/Contract.sol").toString()
  contract = contract.split("##contract##").join(params.contractname);
  if(DEBUG) console.log(contract)
  try{params.fs.mkdirSync(params.contractname)}catch(e){}
  try{params.fs.writeFileSync(params.contractname+"/"+params.contractname+".sol",contract)}catch(e){}
  //deps
  let deps = params.fs.readFileSync(__dirname+"/../templates/dependencies.js").toString()
  params.fs.writeFileSync(params.contractname+"/dependencies.js",deps)
  //args
  let args = params.fs.readFileSync(__dirname+"/../templates/arguments.js").toString()
  params.fs.writeFileSync(params.contractname+"/arguments.js",args)

  let contracts = []
  try{
    contracts = fs.readFileSync("contracts.clevis").toString().trim().split("\n")
  }catch(e){}
  contracts.push(params.contractname)
  fs.writeFileSync("contracts.clevis",contracts.join("\n"))

  return contract;
}
