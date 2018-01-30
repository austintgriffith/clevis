
module.exports = async (params)=>{
  //const DEBUG = params.config.DEBUG;
  //if(DEBUG) console.log(" >>> hex")
  return params.web3.utils.asciiToHex(params.asciistring);
}
