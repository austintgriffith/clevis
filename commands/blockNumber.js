// get latest block number
module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> BLOCK NUMBER")
  return params.web3.eth.getBlockNumber()
}
