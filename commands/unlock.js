module.exports = async (accountIndex, password, params)=>{
  let accounts = await params.web3.eth.getAccounts()
  return params.web3.eth.personal.unlockAccount(accounts[accountIndex], password)
}
