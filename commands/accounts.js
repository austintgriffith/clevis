const fs = require('fs');
const winston = require('winston');

module.exports = async (params) => {
  winston.debug(' >>> ACCOUNTS')
  winston.debug('Reading Accounts...')

  let accounts = await params.web3.eth.getAccounts()
  fs.writeFileSync('accounts.json', JSON.stringify(accounts))

  return accounts
}
