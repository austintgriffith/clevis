
module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> BLOCK")
  return await block(params)
}

function block(params) {
  const DEBUG = params.config.DEBUG;
  return new Promise((resolve, reject) => {
    params.web3.eth.getBlock(params.blocknumber,(error,data)=>{
      resolve(data)
    })
  })
}
