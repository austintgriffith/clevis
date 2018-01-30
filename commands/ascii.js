
module.exports = async (params)=>{
  //const DEBUG = params.config.DEBUG;
  //if(DEBUG) console.log(" >>> ascii")
  return params.web3.utils.hexToAscii(params.hexstring);
}
