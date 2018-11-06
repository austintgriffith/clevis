const fs = require("fs")
module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> NEW ACCOUNT")
  let accounts = await params.web3.eth.getAccounts()
  try{
    let password = params.password
    if(!password) password=""
    await params.web3.eth.personal.newAccount(password)
  }catch(e){
    if("catch",e.toString().indexOf("Method not found")>=0){
      console.log("Method not found natively in RPC, generate a mnemonic locally...")
      let currentEnv = fs.readFileSync(".env")
      if(currentEnv.indexOf("mnemonic")>=0){
        console.log("ERROR, '.env' mnemonic already exists - Try setting 'USE_INFURA: true' in clevis.json")
      }else{
        let result = require("bip39").generateMnemonic()
        if(currentEnv) currentEnv=currentEnv+"\n"
        fs.writeFileSync(".env",currentEnv+"mnemonic="+result)
        console.log("mnemonic created! Set 'USE_INFURA: true' in clevis.json to start using it.")
      }
    }else{
      console.log(e)
    }
  }
  return true
}
