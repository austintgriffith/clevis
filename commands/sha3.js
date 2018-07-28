
module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> SHA3")
  return params.web3.utils.sha3(params.string)
}
