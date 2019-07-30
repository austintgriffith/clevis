module.exports = async (string, accountIndex, password, params)=>{
  let accounts = await params.web3.eth.getAccounts()
  let address = accounts[accountIndex]
  if(address === undefined) {
    throw(`accountIndex: ${accountIndex} is undefined`)
  }
  console.log("password is ",password)
  if(typeof password == "undefined"){
    console.log("using personal sign")
    return params.web3.eth.personal.sign(string, address, password)
  }else{
    return params.web3.eth.sign(string, address)
  }

}
