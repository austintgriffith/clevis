module.exports = async (string, params)=>{
  return params.web3.utils.sha3(string)
}
