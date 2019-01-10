const fs = require('fs');

module.exports = async (params) => {
  let accounts = await params.web3.eth.getAccounts()
  fs.writeFileSync('accounts.json', JSON.stringify(accounts))

  return accounts
}
