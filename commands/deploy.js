const checkForReceipt = require('../utils').checkForReceipt
const fs = require('fs')
const winston = require('winston')


module.exports = async (contractName, accountIndex, params)=>{
  let startSeconds = new Date().getTime() / 1000
  winston.debug(`Unlocking account: ${accountIndex}`)
  let accounts = await params.web3.eth.getAccounts();
  winston.debug(`accounts: ${accounts}`)
  let balance = await params.web3.eth.getBalance(accounts[accountIndex])
  winston.debug(`balance: ${balance}`)

  //if(balance < 10*10**18){
  //  let result = await params.web3.eth.personal.unlockAccount(accounts[1])
  //}

  const contractFolder = `${params.config.CONTRACTS_FOLDER}/${contractName}`;
  winston.debug(`contractFolder: ${contractFolder}`);
  let bytecode = fs.readFileSync(contractFolder+"/"+contractName+".bytecode").toString()
  let abi = JSON.parse(fs.readFileSync(contractFolder+"/"+contractName+".abi"));
  let etherbalance = params.web3.utils.fromWei(balance,"ether");
  winston.debug(etherbalance+" ($"+(etherbalance*params.config.ethprice)+")")
  winston.debug(`Loaded account: ${accounts[accountIndex]}`)
  winston.debug("Deploying...")
  let contract = new params.web3.eth.Contract(abi)

  winston.debug(`Paying a max of: ${params.config.deploygas} gas`)
  winston.debug(`With the gas price of: ${params.config.gasprice}`)

  let contractarguments = []
  try{
    let path = process.cwd()+"/"+contractFolder+"/arguments.js"
    if(fs.existsSync(path)){
      winston.debug(`looking for arguments in ${path}`)
      contractarguments=require(path)
    }
  }catch(e){console.log(e)}

  winston.debug(`Arguments: ${contractarguments}`)
  let result = await deploy(params,accounts,contractarguments,bytecode,abi, accountIndex)

  let newbalance = await params.web3.eth.getBalance(accounts[accountIndex])
  let endetherbalance = params.web3.utils.fromWei(newbalance,"ether");
  let etherdiff = etherbalance-endetherbalance
  winston.debug(`==ETHER COST: ${etherdiff} $${(etherdiff * params.config.ethprice)}`)
  winston.debug(`Saving contract address: ${result.contractAddress}`)
  let addressPath = process.cwd()+"/"+contractFolder+"/"+contractName+".address"
  if(fs.existsSync(addressPath)){
    fs.writeFileSync(process.cwd()+"/"+contractFolder+"/"+contractName+".previous.address",fs.readFileSync(addressPath).toString())
  }
  let headAddressPath = process.cwd()+"/"+contractFolder+"/"+contractName+".head.address"
  if(!fs.existsSync(headAddressPath)){
    fs.writeFileSync(headAddressPath,result.contractAddress)
  }
  fs.writeFileSync(addressPath,result.contractAddress)
  fs.writeFileSync(process.cwd()+"/"+contractFolder+"/"+contractName+".blockNumber",result.blockNumber)

  let endSeconds = new Date().getTime() / 1000;
  let duration = Math.floor((endSeconds-startSeconds))
  winston.debug(`deploy time: ${duration}`)
  fs.appendFileSync(process.cwd()+"/deploy.log",endSeconds+" "+contractFolder+"/"+contractName+" "+result.contractAddress+" "+duration+" "+etherdiff+" $"+(etherdiff*params.config.ethprice)+" "+params.config.gasprice+"\n")

  return result;
}

function deploy(params,accounts,contractarguments,bytecode,abi, accountIndex) {
  return new Promise((resolve, reject) => {
    winston.debug(`Creating contract from abi: ${abi}`)
    let contract = new params.web3.eth.Contract(abi)
    winston.debug(`Deploying contract with bytecode: ${bytecode}`)
    let deployed = contract.deploy({
      data: "0x"+bytecode,
      arguments: contractarguments
    }).send({
      from: accounts[accountIndex],
      gas: params.config.deploygas,
      gasPrice: params.config.gasprice
    }, function(error, transactionHash){
      winston.debug(`CALLBACK: ${error}\n${transactionHash}`)
      checkForReceipt(2,params,transactionHash,resolve)
    })
  })
}
