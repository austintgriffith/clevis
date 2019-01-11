
module.exports = async (hexString, params)=>{
  return params.web3.utils.hexToUtf8(hexString);
}
