module.exports = async (params)=>{
  console.log("SEND")
  let accounts = await params.web3.eth.getAccounts()
  let txparams = {
    from: accounts[params.from],
    to: accounts[params.to],
    value: params.web3.utils.toWei(params.amount, "ether"),
    gas: params.config.gas,
    gasPrice: params.config.gaspricegwei
  }
  console.log(accounts)
  console.log(txparams)
  let tx = await params.web3.eth.sendTransaction(txparams)
  console.log(tx)
  setInterval(async ()=>{
    let a = await params.web3.eth.getTransactionReceipt(tx.transactionHash)//,(error,result)=>{
      console.log(a)
    /*if(receipt&&receipt.to&&receipt.from){
      console.log(receipt)
    }else{
      console.log(".")
    }*/
  },1000)

}
