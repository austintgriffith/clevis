const winston = require('winston')

function checkForReceipt(backoffMs, params, transactionHash, resolve, reject) {
  params.web3.eth.getTransactionReceipt(transactionHash,(error,result) => {
    if (error) {
        reject(error)
    }
    if(result && result.transactionHash){
      winston.debug(result)
      resolve(result)
    } else {
      if(winston.level === 'debug') process.stdout.write(".")
      backoffMs = Math.min(backoffMs * 2, 1000)
      setTimeout(checkForReceipt.bind(this, backoffMs, params, transactionHash, resolve), backoffMs)
    }
  })
}

async function normalizeAddress(addr, web3) {
  if(web3.utils.isAddress(addr)) {
    return web3.utils.toChecksumAddress(addr)
  } else {
    let accounts = await web3.eth.getAccounts()
    if(accounts[addr] !== undefined) {
      return accounts[addr]
    } else {
      throw(`Could not normalize address: ${addr}`)
    }
  }
}

module.exports = {
  checkForReceipt,
  normalizeAddress
}
