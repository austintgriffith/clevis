module.exports = async (string, accountIndex, params)=>{
  let accounts = await params.web3.eth.getAccounts()
  let address = accounts[accountIndex]
  if(address === undefined) {
    throw(`accountIndex: ${accountIndex} is undefined`)
  }
  return params.web3.eth.sign(string, address)
}
