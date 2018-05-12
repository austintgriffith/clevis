
module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> BALANCE")
  return await balance(params)
}

function balance(params) {
  const DEBUG = params.config.DEBUG;
  return new Promise((resolve, reject) => {
    params.web3.eth.getBalance(params.address,(error,balance)=>{
      if(DEBUG) console.log(error,balance)
      let ether = params.web3.utils.fromWei(balance, "ether")
      resolve({ether:ether,wei:balance,usd:Math.round(params.config.ethprice*ether*100)/100})
    })
  })
}
