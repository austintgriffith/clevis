const checkForReceipt = require('../utils').checkForReceipt
const fs = require('fs')
const winston = require('winston')

//TODO: Needs a cleanup
module.exports = async (scriptName, contractName, accountIndex, contractArguments, params)=>{
  console.log('contractArguments: ', contractArguments);
  winston.debug(" >>> CONTRACT")
  let startSeconds = new Date().getTime() / 1000
  const contractFolder = `${params.config.CONTRACTS_FOLDER}/${contractName}`;
  winston.debug("Loading accounts...")
  let accounts = await params.web3.eth.getAccounts();

  winston.debug("Loading address, abi, and blockNumber...")
  let nextAddress //ported in from old code that detected previous for linage (TODO)
  let address = fs.readFileSync(process.cwd()+"/"+contractFolder+"/"+contractName+".address").toString().trim()
  let abi = JSON.parse(fs.readFileSync(process.cwd()+"/"+contractFolder+"/"+contractName+".abi"));
  let blockNumber = fs.readFileSync(process.cwd()+"/"+contractFolder+"/"+contractName+".blockNumber").toString().trim()

  winston.debug("Running contract interaction script ("+scriptName+") on contract ["+contractName+"]")
  let contract = new params.web3.eth.Contract(abi,address)

  winston.debug("paying a max of "+params.config.xfergas+" gas @ the price of "+params.config.gasprice+" gwei ("+params.config.gaspricegwei+")")

  let scriptFunction
  try{
    let path = process.cwd()+"/"+contractFolder+"/.clevis/"+scriptName+".js"
    winston.debug(`LOADING: ${path}`)
    if(fs.existsSync(path)){
      winston.debug(`looking for script at ${path}`)
      scriptFunction=require(path)
    }
  }catch(e){console.log(e)}
  if(scriptFunction){
    winston.debug(`Loaded script (${scriptName}), running...`)
    let txparams = {
      gas:params.config.xfergas,
      gasPrice:params.config.gaspricegwei,
      accounts:accounts,
      blockNumber:blockNumber,
    }
    //check for previous address to pass along
    let previousAddressFile = process.cwd()+"/"+contractFolder+"/"+contractName+".previous.address"
    if(fs.existsSync(previousAddressFile)){
      txparams.previousAddress = fs.readFileSync(previousAddressFile).toString()
    }
    if(nextAddress) txparams.nextAddress = nextAddress; //TODO
    winston.debug(txparams)
    txparams.web3=params.web3//pass the web3 object so scripts have the utils
    return await doContractFunction(params,scriptName,scriptFunction,contract,txparams, accountIndex, contractArguments)
  }
}

let doContractFunction = (params,scriptName,scriptFunction,contract,txparams, accountIndex, contractArguments)=>{
  return new Promise((resolve, reject) => {

    //TODO: This part here is an artifact of how the script gets generated.
    //TODO: This is bad bad bad
    //It expects the first three args to be arguments for clevis
    //The fourth to be the accountIndex of the from
    //And the rest as function args
    //We should decouple the way clevis generates these "scripts" so this is not the case.
    let hackyContractArgs = [null, null, null, accountIndex, ...contractArguments]
    console.log('hackyContractArgs: ', hackyContractArgs);
    let scriptPromise = scriptFunction(contract,txparams,hackyContractArgs)

    if(!scriptPromise || typeof scriptPromise.once != "function"){
      winston.debug(""+scriptName+" (no promise)")
      resolve(scriptPromise)
    } else {
      scriptPromise.on("error",function(err){
        if(err.toString().indexOf("Transaction was not mined within 50 blocks")>=0){
          winston.debug("IGNORE 'within 50 block' ERROR...")
        } else {
          winston.debug(`CAUGHT ${err} REJECTING`)
          reject(err);
        }
      })
      let result = scriptPromise.once('transactionHash', function(transactionHash){
        winston.debug("transactionHash:"+transactionHash)
        checkForReceipt(2,params,transactionHash,resolve)
      })
    }
  })
}
