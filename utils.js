const winston = require('winston')

function checkForReceipt(backoffMs, params, transactionHash, resolve) {
  params.web3.eth.getTransactionReceipt(transactionHash,(error,result) => {
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

module.exports = {
  checkForReceipt
}
