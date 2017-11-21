module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> UNLOCK")
  let accounts = await params.web3.eth.getAccounts()
  await params.web3.eth.personal.unlockAccount(accounts[params.accountindex])
  return true
}
