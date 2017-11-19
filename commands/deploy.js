module.exports = async (params)=>{
  const DEBUG = false;
  let accountindex = params.accountindex
  let startSeconds = new Date().getTime() / 1000
  if(DEBUG) console.log("Unlocking account "+accountindex)
  let accounts = await params.web3.eth.getAccounts();
  let balance = await params.web3.eth.getBalance(accounts[accountindex])
  if(balance < 10*10**18){
    let result = await params.web3.eth.personal.unlockAccount(accounts[1])
  }
  let contractname = params.contractname
  let bytecode = params.fs.readFileSync(contractname+"/"+contractname+".bytecode").toString()
  let abi = JSON.parse(params.fs.readFileSync(contractname+"/"+contractname+".abi"));
  let etherbalance = params.web3.utils.fromWei(balance,"ether");
  if(DEBUG) console.log(etherbalance+" ($"+(etherbalance*params.config.ethprice)+")")
  if(DEBUG) console.log("Loaded account "+accounts[params.accountindex])
  if(DEBUG) console.log("Deploying...")
  let contract = new params.web3.eth.Contract(abi)
  if(DEBUG) console.log("paying a max of "+params.config.deploygas+" gas @ the price of "+params.config.gasprice+" gwei ("+params.config.gaspricegwei+")")

  let contractarguments = []
  try{
    let path = process.cwd()+"/"+contractname+"/arguments.js"
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
  let addressPath = process.cwd()+"/"+contractname+"/"+contractname+".address"
  if(params.fs.existsSync(addressPath)){
    params.fs.writeFileSync(process.cwd()+"/"+contractname+"/"+contractname+".previous.address",params.fs.readFileSync(addressPath).toString())
  }
  let headAddressPath = process.cwd()+"/"+contractname+"/"+contractname+".head.address"
  if(!params.fs.existsSync(headAddressPath)){
    params.fs.writeFileSync(headAddressPath,result.contractAddress)
  }
  params.fs.writeFileSync(addressPath,result.contractAddress)
  params.fs.writeFileSync(process.cwd()+"/"+contractname+"/"+contractname+".blockNumber",result.blockNumber)

  let endSeconds = new Date().getTime() / 1000;
  let duration = Math.floor((endSeconds-startSeconds))
  if(DEBUG) console.log("deploy time: ",duration)
  params.fs.appendFileSync(process.cwd()+"/deploy.log",endSeconds+" "+contractname+"/"+contractname+" "+result.contractAddress+" "+duration+" "+etherdiff+" $"+(etherdiff*params.config.ethprice)+" "+params.config.gaspricegwei+"\n")

  console.log(result);
}

function deploy(params,accounts,contractarguments,bytecode,abi) {
  const DEBUG = false;
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
      let wait = setInterval(()=>{
        params.web3.eth.getTransactionReceipt(transactionHash,(error,result)=>{
          if(result&&result.contractAddress){
            if(DEBUG) console.log(result)
            clearInterval(wait)
            resolve(result)
          }else{
            if(DEBUG) process.stdout.write(".")
          }
        })
      },1000)
    })
  })
}
