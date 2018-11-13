const fs = require('fs')
module.exports = (params)=>{
  let contracts = []
  try{
    contracts = fs.readFileSync("contracts.clevis").toString().trim().split("\n")
  }catch(e){}
  if (contracts.find((elem) => elem === params.contractname)) {
    console.error(`ERROR: Contract with name ${params.contractname} already exists.`);
    return "Please try with a different name";
  }
  const DEBUG = params.config.DEBUG;
  const contractFolder = `${params.config.CONTRACTS_FOLDER}/${params.contractname}`;
  if(DEBUG) console.log(" >>> CREATE")
  let contract = params.fs.readFileSync(__dirname+"/../templates/Contract.sol").toString()
  contract = contract.split("##contract##").join(params.contractname);
  if(DEBUG) console.log(contract)
  try{params.fs.mkdirSync(contractFolder)}catch(e){}
  try{params.fs.writeFileSync(contractFolder+"/"+params.contractname+".sol",contract)}catch(e){}
  //deps
  let deps = params.fs.readFileSync(__dirname+"/../templates/dependencies.js").toString()
  params.fs.writeFileSync(contractFolder+"/dependencies.js",deps)
  //args
  let args = params.fs.readFileSync(__dirname+"/../templates/arguments.js").toString()
  params.fs.writeFileSync(contractFolder+"/arguments.js",args)
  contracts.push(params.contractname)
  fs.writeFileSync("contracts.clevis",contracts.join("\n"))

  return contract;
}
