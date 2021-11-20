
module.exports = async (textString, params)=>{
  return params.web3.utils.utf8ToHex(textString);
}
