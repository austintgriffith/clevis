
module.exports = async (params)=>{
  //const DEBUG = params.config.DEBUG;
  if(params.DEBUG) console.log(" >>> RANDOM HEX")
  return params.web3.utils.randomHex(parseInt(params.size));
}
