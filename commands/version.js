module.exports = (params)=>{
  let pkg = "0.0.0"
  try{
    pkg = JSON.parse(params.fs.readFileSync(__dirname+"/../package.json").toString())
  }catch(e){console.log(e)}
  console.log("Clevis: "+pkg.version)
  console.log("Web3: "+params.web3.version)
}
