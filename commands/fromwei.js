
module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> FROM WEI")
  return params.web3.utils.fromWei(params.amount,params.symbol);
}
