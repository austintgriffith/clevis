const normalizeAddress = require('../utils').normalizeAddress
const winston = require('winston')

module.exports = async (address, units, params) => {
  units = units || 'ether';

  let addr = await normalizeAddress(address, params.web3)
  winston.debug(`Normalized address: ${addr}`)

  let balance = await params.web3.eth.getBalance(addr)
  let inUnits = params.web3.utils.fromWei(balance, units)

  winston.debug(`${inUnits} ${units}`)
  return inUnits
}
