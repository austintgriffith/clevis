
module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> SIGN")
  let accounts = await params.web3.eth.getAccounts()
  return params.web3.eth.personal.sign(params.string,accounts[params.accountindex],params.password)
}
