module.exports = async (string, signature, params)=>{
  return params.web3.eth.personal.ecRecover(string, signature)
}
