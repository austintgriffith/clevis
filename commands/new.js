module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> NEW ACCOUNT")
  let accounts = await params.web3.eth.getAccounts()
  await params.web3.eth.personal.newAccount(params.password)
  return true
}
