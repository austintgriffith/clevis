
module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> SENDTO")
  let accounts = await params.web3.eth.getAccounts()
  let txparams = {
    from: accounts[params.fromindex],
    to: params.toaddress,
    value: params.web3.utils.toWei(params.amount, "ether"),
    gas: params.config.xfergas,
    gasPrice: params.config.gaspricegwei
  }
  if(DEBUG) console.log(accounts)
  if(DEBUG) console.log(txparams)
  return await send(params,txparams)
}

function send(params,txparams) {
  const DEBUG = params.config.DEBUG;
  return new Promise((resolve, reject) => {
    if(DEBUG) console.log(txparams)
    params.web3.eth.sendTransaction(txparams,(error,transactionHash)=>{
      if(DEBUG) console.log(error,transactionHash)
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
