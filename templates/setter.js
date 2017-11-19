//
// usage: clevis contract ##method## ##contract## ##accountindex## ##hintargs##
//

module.exports = (contract,params,args)=>{
  const DEBUG = false
  if(DEBUG) console.log("**== Running ##method##(##argstring##) as account ["+params.accounts[args[5]]+"]")
  return contract.methods.##method##(##args##).send({
    from: params.accounts[args[5]],
    gas: params.gas,
    gasPrice:params.gasPrice
  })
}
