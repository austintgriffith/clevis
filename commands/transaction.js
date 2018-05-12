
module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> TRANSACTION")
  return await block(params)
}

function block(params) {
  const DEBUG = params.config.DEBUG;
  return new Promise((resolve, reject) => {
    console.log("getting tx",params.hash)
    params.web3.eth.getTransaction(params.hash,(error,data)=>{
      console.log(error,data)
      resolve(data)
    })
  })
}
