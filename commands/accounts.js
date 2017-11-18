module.exports = async (params)=>{
  console.log("Reading Accounts...")
  let accounts = await params.web3.eth.getAccounts()
  console.log("accounts:",accounts)
  params.fs.writeFileSync("accounts.json",JSON.stringify(accounts))
}
