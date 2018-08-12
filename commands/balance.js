
module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> BALANCE")
  return await balance(params)
}

function balance(params) {
  const DEBUG = params.config.DEBUG;
  return new Promise(async (resolve, reject) => {
    let addr = params.address
    if(addr.length>0&&addr.length<40){
      let accounts = await params.web3.eth.getAccounts()
      addr = accounts[addr]
    }else if(addr.length<42){
      addr = "0x"+addr
    }
    params.web3.eth.getBalance(""+addr,(error,balance)=>{
      if(DEBUG) console.log(error,balance)
      let ether = params.web3.utils.fromWei(balance, "ether")
      resolve({ether:ether,wei:balance,usd:Math.round(params.config.ethprice*ether*100)/100})
    })
  })
}
