const { checkForReceipt, normalizeAddress } = require('../utils')
const winston = require('winston')

module.exports = async (amount, fromAddress, toAddress, data, params) => {
  let from = await normalizeAddress(fromAddress, params.web3)
  winston.debug(`Normalized from address: ${from}`)

  let to = await normalizeAddress(toAddress, params.web3)
  winston.debug(`Normalized to address: ${to}`)

  let txparams = {
    from: from,
    to: to,
    value: params.web3.utils.toWei(amount, "ether"),
    gas: params.config.xfergas,
    gasPrice: parseInt(params.config.gasprice)
  }

  if(data !== undefined) {
    winston.debug(`Adding data to payload: ${data}`)
    txparams['data'] = data
  }
  winston.debug((txparams.gasPrice/1000000000)+" gwei")
  winston.debug(JSON.stringify(txparams,null,2))

  return await send(params,txparams)
}

function send(params,txparams) {
  return new Promise((resolve, reject) => {
    params.web3.eth.sendTransaction(txparams,(error, transactionHash) => {
      winston.debug(`Error: ${error} : transactionHash: ${transactionHash}`)
      checkForReceipt(2, params, transactionHash, resolve)
    })
  })
}
