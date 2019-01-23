const fs = require('fs')
const winston = require('winston')

module.exports = (contractName, params)=>{
  let contracts = []
  const contractFolder = `${params.config.CONTRACTS_FOLDER}/${contractName}`;

  try{
    contracts = fs.readFileSync("contracts.clevis").toString().trim().split("\n")
  } catch(e) {
    winston.debug("contracts.clevis didn't exist. Will create it.")
  }

  if (contracts.find((elem) => elem === contractName)) {
    console.error(`ERROR: Contract with name ${contractName} already exists.`);
    return "Please try with a different name";
  }

  let contract = readTemplate('Contract.sol')
  contract = contract.split("##contract##").join(contractName);
  winston.debug(contract)

  try{fs.mkdirSync(contractFolder)}catch(e){}
  try{fs.writeFileSync(contractFolder+"/"+contractName+".sol",contract)}catch(e){}

  let deps = readTemplate('dependencies.js')
  fs.writeFileSync(`${contractFolder}/dependencies.js`, deps)
  let args = readTemplate('arguments.js')
  fs.writeFileSync(`${contractFolder}/arguments.js`, args)

  contracts.push(contractName)

  fs.writeFileSync("contracts.clevis", contracts.join("\n"))

  return contract;
}

function readTemplate(resource) {
  return fs.readFileSync(`${__dirname}/../templates/${resource}`).toString()
}
