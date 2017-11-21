//
// usage: clevis contract ##method## ##contract##
//
module.exports = async (contract,params,args)=>{
  return await contract.methods.##method##(##inputs##).call()

  /*.then((##outputs##)=>{
    console.log(##results##)
  })*/
}
