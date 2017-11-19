module.exports = async (params)=>{
  const DEBUG = true;
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
      console.log("looking for arguments in ",path)
      contractarguments=require(path)
    }
  }catch(e){console.log(e)}

  if(DEBUG) console.log("Arguments: ",contractarguments)

  
}


function deploy(params,contractarguments,bytecode,abi) {
  return new Promise((resolve, reject) => {

    let contract = new params.web3.eth.Contract(abi)


    let deployed = contract.deploy({
      data: "0x"+bytecode,
      arguments: contractarguments
    }).send({
      from: accounts[ACCOUNT_INDEX],
      gas: gas,
      gasPrice: gaspricegwei
    }, function(error, transactionHash){
      console.log("CALLBACK",error, transactionHash)
    })

  })
}

/*
function deployContract(accounts,balance){
  let etherbalance = web3.utils.fromWei(balance,"ether");
  console.log(etherbalance+" $"+(etherbalance*ethPrice))
  console.log("\nLoaded account "+accounts[ACCOUNT_INDEX])
  console.log("Deploying...",bytecode,abi)

  let gasPrice = fs.readFileSync("gasprice.int").toString().trim()
  let gas = fs.readFileSync("deploygas.int").toString().trim()
  let gaspricegwei = gasPrice*10*10**8


  console.log("arguments:",contractarguments)
  let deployed = contract.deploy({
    data: "0x"+bytecode,
    arguments: contractarguments
  }).send({
    from: accounts[ACCOUNT_INDEX],
    gas: gas,
    gasPrice: gaspricegwei
  }, function(error, transactionHash){
    console.log("CALLBACK",error, transactionHash)
    setInterval(()=>{
      web3.eth.getTransactionReceipt(transactionHash,(error,result)=>{
        if(result && result.contractAddress && result.cumulativeGasUsed){
          console.log("Success",result)
          web3.eth.getBalance(accounts[ACCOUNT_INDEX]).then((balance)=>{
            let endetherbalance = web3.utils.fromWei(balance,"ether");
            let etherdiff = etherbalance-endetherbalance
            console.log("==ETHER COST: "+etherdiff+" $"+(etherdiff*ethPrice))
            console.log("Saving contract address:",result.contractAddress)
            let addressPath = contractdir+"/"+contractname+".address"
            if(fs.existsSync(addressPath)){
              fs.writeFileSync(contractdir+"/"+contractname+".previous.address",fs.readFileSync(addressPath).toString())
            }
            let headAddressPath = contractdir+"/"+contractname+".head.address"
            if(!fs.existsSync(headAddressPath)){
              fs.writeFileSync(headAddressPath,result.contractAddress)
            }
            fs.writeFileSync(addressPath,result.contractAddress)
            fs.writeFileSync(contractdir+"/"+contractname+".blockNumber",result.blockNumber)

            let endSeconds = new Date().getTime() / 1000;
            let duration = Math.floor((endSeconds-startSeconds))
            console.log("deploy time: ",duration)
            fs.appendFileSync("./deploy.log",contractdir+"/"+contractname+" "+result.contractAddress+" "+duration+" "+etherdiff+" $"+(etherdiff*ethPrice)+" "+gaspricegwei+"\n")
            process.exit(0);
          })
        }else{
          process.stdout.write(".")
        }
      })
    },1000)
  })
}
*/
