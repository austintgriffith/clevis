const winston = require('winston')

module.exports = async (address, units, params) => {
  units = units || 'ether';

  let accounts = await params.web3.eth.getAccounts()
  let balance = await params.web3.eth.getBalance(accounts[address])
  let inUnits = params.web3.utils.fromWei(balance, units)

  winston.debug(`${inUnits} ${units}`)
  return inUnits
}
