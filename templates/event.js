//
// usage: node contract ##event## ##contract##
//
module.exports = (contract,params,args)=>{
  return contract.getPastEvents('##event##', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  })
}
