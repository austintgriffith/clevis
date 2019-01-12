const checkForReceipt = require('../utils').checkForReceipt
const winston = require('winston')

module.exports = async (amount, fromIndex, toIndex, data, params) => {
  let accounts = await params.web3.eth.getAccounts()

  verifyAccountIndex(accounts, fromIndex)
  verifyAccountIndex(accounts, toIndex)

  let txparams = {
    from: accounts[fromIndex],
    to: accounts[toIndex],
    value: params.web3.utils.toWei(amount, "ether"),
    gas: params.config.xfergas,
    gasPrice: params.config.gasprice
  }

  if(data !== undefined) {
    winston.debug(`Adding data to payload: ${data}`)
    txparams['data'] = data
  }

  winston.debug(txparams)

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

function verifyAccountIndex(accounts, index) {
  if(accounts[index] === undefined) {
    if(accounts.length === 0) {
      throw(`index: ${index} not valid. There are no accounts.`)
    }
    throw(`Account index: ${index} not valid. Please select an index between 0 and ${accounts.length - 1}`)
  }
}
