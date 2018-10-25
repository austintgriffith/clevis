
module.exports = async (params)=>{
  //const DEBUG = params.config.DEBUG;
  if(params.DEBUG) console.log(" >>> HEX TO TEXT")
  return params.web3.utils.hexToUtf8(params.hexstring);
}
