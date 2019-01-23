
module.exports = async (size, params)=>{
  return params.web3.utils.randomHex(parseInt(size));
}
