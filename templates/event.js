//
// usage: node contract ##event## ##contract##
//
module.exports = (contract,params,args)=>{
  contract.getPastEvents('##event##', {
      fromBlock: params.blockNumber,
      toBlock: 'latest'
  }, function(error, events){
    console.log(events);
  })
}
