module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> CONTRACT")
  let startSeconds = new Date().getTime() / 1000
  let contractname = params["contractname"];
  let scriptname = params["scriptname"];

  if(DEBUG) console.log("Loading accounts...")
  let accounts = await params.web3.eth.getAccounts();

  if(DEBUG) console.log("Loading address, abi, and blockNumber...")
  let nextAddress //ported in from old code that detected previous for linage (TODO)
  let address = params.fs.readFileSync(process.cwd()+"/"+contractname+"/"+contractname+".address").toString().trim()
  let abi = JSON.parse(params.fs.readFileSync(process.cwd()+"/"+contractname+"/"+contractname+".abi"));
  let blockNumber = params.fs.readFileSync(process.cwd()+"/"+contractname+"/"+contractname+".blockNumber").toString().trim()

  if(DEBUG) console.log("Running contract interaction script ("+scriptname+") on contract ["+contractname+"]")
  let contract = new params.web3.eth.Contract(abi,address)

  if(DEBUG) console.log("paying a max of "+params.config.xfergas+" gas @ the price of "+params.config.gasprice+" gwei ("+params.config.gaspricegwei+")")

  let scriptFunction
  try{
    let path = process.cwd()+"/"+contractname+"/"+scriptname+".js"
    if(DEBUG) console.log("LOADING:",path)
    if(params.fs.existsSync(path)){
      if(DEBUG) console.log("looking for script at ",path)
      scriptFunction=require(path)
    }
  }catch(e){console.log(e)}
  if(scriptFunction){
    if(DEBUG) console.log("Loaded script ("+scriptname+"), running...")
    let txparams = {
      gas:params.config.xfergas,
      gasPrice:params.config.gaspricegwei,
      accounts:accounts,
      blockNumber:blockNumber,
    }
    //check for previous address to pass along
    let previousAddressFile = process.cwd()+"/"+contractname+"/"+contractname+".previous.address"
    if(params.fs.existsSync(previousAddressFile)){
      txparams.previousAddress = params.fs.readFileSync(previousAddressFile).toString()
    }
    if(nextAddress) txparams.nextAddress = nextAddress; //TODO
    if(DEBUG) console.log(txparams)
    txparams.web3=params.web3//pass the web3 object so scripts have the utils
    return await doContractFunction(params,scriptname,scriptFunction,contract,txparams)
  }
}

let doContractFunction = (params,scriptname,scriptFunction,contract,txparams)=>{
  const DEBUG = params.config.DEBUG;
  return new Promise((resolve, reject) => {
    let scriptPromise = scriptFunction(contract,txparams,params.args)
    if(!scriptPromise || typeof scriptPromise.once != "function"){
      if(DEBUG) console.log(""+scriptname+" (no promise)")
    }else{
      let result = scriptPromise.once('transactionHash', function(transactionHash){
        if(DEBUG) console.log("transactionHash:"+transactionHash)
        let wait = setInterval(()=>{
          params.web3.eth.getTransactionReceipt(transactionHash,(error,result)=>{
            if(result){
              if(DEBUG) console.log(result)
              clearInterval(wait)
              resolve(result)
            }else{
              if(DEBUG) process.stdout.write(".")
            }
          })
        },1000)
      })
    }
  })
}
