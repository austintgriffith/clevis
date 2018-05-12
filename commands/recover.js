
module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> RECOVER")
  return params.web3.eth.personal.ecRecover(params.string,params.signature)
}
