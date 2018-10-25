
module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> WEI")
  return params.web3.utils.toWei(params.amount,params.symbol);
}
