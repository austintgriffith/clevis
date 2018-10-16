module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> DEPLOY")
  let accountindex = params.accountindex
  let startSeconds = new Date().getTime() / 1000
  if(DEBUG) console.log("Unlocking account "+accountindex)
  let accounts = await params.web3.eth.getAccounts();
  console.log("accounts",accounts)
  let balance = await params.web3.eth.getBalance(accounts[accountindex])
    console.log("balance",balance)
  //if(balance < 10*10**18){
  //  let result = await params.web3.eth.personal.unlockAccount(accounts[1])
  //}
  let contractname = params.contractname
  const contractFolder = `${params.config.CONTRACTS_FOLDER}/${contractname}`;
  console.log('contractFolder', contractFolder);
  let bytecode = params.fs.readFileSync(contractFolder+"/"+contractname+".bytecode").toString()
  let abi = JSON.parse(params.fs.readFileSync(contractFolder+"/"+contractname+".abi"));
  let etherbalance = params.web3.utils.fromWei(balance,"ether");
  if(DEBUG) console.log(etherbalance+" ($"+(etherbalance*params.config.ethprice)+")")
  if(DEBUG) console.log("Loaded account "+accounts[params.accountindex])
  if(DEBUG) console.log("Deploying...")
  let contract = new params.web3.eth.Contract(abi)
  if(DEBUG) console.log("paying a max of "+params.config.deploygas+" gas @ the price of "+params.config.gasprice+" gwei ("+params.config.gaspricegwei+")")

  let contractarguments = []
  try{
    let path = process.cwd()+"/"+contractFolder+"/arguments.js"
    if(params.fs.existsSync(path)){
      if(DEBUG) console.log("looking for arguments in ",path)
      contractarguments=require(path)
    }
  }catch(e){console.log(e)}

  if(DEBUG) console.log("Arguments: ",contractarguments)
  let result = await deploy(params,accounts,contractarguments,bytecode,abi)

  let newbalance = await params.web3.eth.getBalance(accounts[params.accountindex])
  let endetherbalance = params.web3.utils.fromWei(newbalance,"ether");
  let etherdiff = etherbalance-endetherbalance
  if(DEBUG) console.log("==ETHER COST: "+etherdiff+" $"+(etherdiff*params.config.ethprice))
  if(DEBUG) console.log("Saving contract address:",result.contractAddress)
  let addressPath = process.cwd()+"/"+contractFolder+"/"+contractname+".address"
  if(params.fs.existsSync(addressPath)){
    params.fs.writeFileSync(process.cwd()+"/"+contractFolder+"/"+contractname+".previous.address",params.fs.readFileSync(addressPath).toString())
  }
  let headAddressPath = process.cwd()+"/"+contractFolder+"/"+contractname+".head.address"
  if(!params.fs.existsSync(headAddressPath)){
    params.fs.writeFileSync(headAddressPath,result.contractAddress)
  }
  params.fs.writeFileSync(addressPath,result.contractAddress)
  params.fs.writeFileSync(process.cwd()+"/"+contractFolder+"/"+contractname+".blockNumber",result.blockNumber)

  let endSeconds = new Date().getTime() / 1000;
  let duration = Math.floor((endSeconds-startSeconds))
  if(DEBUG) console.log("deploy time: ",duration)
  params.fs.appendFileSync(process.cwd()+"/deploy.log",endSeconds+" "+contractFolder+"/"+contractname+" "+result.contractAddress+" "+duration+" "+etherdiff+" $"+(etherdiff*params.config.ethprice)+" "+params.config.gaspricegwei+"\n")

  return result;
}

function deploy(params,accounts,contractarguments,bytecode,abi) {
  const DEBUG = params.config.DEBUG;
  return new Promise((resolve, reject) => {
    if(DEBUG) console.log("Creating contract from abi: ",abi)
    let contract = new params.web3.eth.Contract(abi)
    if(DEBUG) console.log("Deploying contract with bytecode: ",bytecode)
    let deployed = contract.deploy({
      data: "0x"+bytecode,
      arguments: contractarguments
    }).send({
      from: accounts[params.accountindex],
      gas: params.config.deploygas,
      gasPrice: params.config.gaspricegwei
    }, function(error, transactionHash){
      if(DEBUG) console.log("CALLBACK",error, transactionHash)
      checkForReceipt(2,DEBUG,params,transactionHash,resolve)
    })
  })
}

function checkForReceipt(backoffMs,DEBUG,params,transactionHash,resolve){
  params.web3.eth.getTransactionReceipt(transactionHash,(error,result)=>{
    if(result&&result.transactionHash){
      if(DEBUG) console.log(result)
      resolve(result)
    }else{
      if(DEBUG) process.stdout.write(".")
      backoffMs=Math.min(backoffMs*2,1000)
      setTimeout(checkForReceipt.bind(this,backoffMs,DEBUG,params,transactionHash,resolve),backoffMs)
    }
  })
}
