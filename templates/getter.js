//
// usage: clevis contract ##method## ##contract##
//
module.exports = (contract,params,args)=>{
  contract.methods.##method##(##inputs##).call().then((##outputs##)=>{
    return (##results##)
  })
}
