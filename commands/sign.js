module.exports = async (string, accountIndex, password, params)=>{
  let accounts = await params.web3.eth.getAccounts()
  let address = accounts[accountIndex]
  if(address === undefined) {
    throw(`accountIndex: ${accountIndex} is undefined`)
  }

  return params.web3.eth.personal.sign(string, address, password)
}
