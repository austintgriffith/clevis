
module.exports = async (params)=>{
  //const DEBUG = params.config.DEBUG;
  if(params.DEBUG) console.log(" >>> TEXT TO HEX")
  return params.web3.utils.utf8ToHex(params.textstring);
}
