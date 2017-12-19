//usage: clevis sendData 1 0 0xC5fdf4076b8F3A5357c5E395ab970B5B54098Fef (clevis hex "hello world")
module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> SENDDATA")
  let accounts = await params.web3.eth.getAccounts()
  let txparams = {
    from: accounts[params.fromindex],
    to: params.toaddress,
    data: params.data,
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
      let wait = setInterval(()=>{
        params.web3.eth.getTransactionReceipt(transactionHash,(error,result)=>{
          if(result&&result.transactionHash){
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
