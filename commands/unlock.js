module.exports = async (params)=>{
  let accounts = await params.web3.eth.getAccounts()
  await params.web3.eth.personal.unlockAccount(accounts[params.accountindex])
}
