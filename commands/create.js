module.exports = (params)=>{
  let contract = params.fs.readFileSync(__dirname+"/../templates/Contract.sol").toString()
  contract = contract.split("Contract").join(params.contractname);
  console.log(contract)
  try{params.fs.mkdirSync(params.contractname)}catch(e){}
  try{params.fs.writeFileSync(params.contractname+"/"+params.contractname+".sol",contract)}catch(e){}
}
