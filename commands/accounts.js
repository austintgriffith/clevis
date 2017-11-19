module.exports = async (params)=>{
  const DEBUG = false
  if(DEBUG) console.log("Reading Accounts...")
  let accounts = await params.web3.eth.getAccounts()
  if(DEBUG) console.log("accounts:",accounts)
  params.fs.writeFileSync("accounts.json",JSON.stringify(accounts))
  return accounts
}
