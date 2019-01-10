const winston = require('winston');

module.exports = (amount, symbol, params) => {
  winston.debug(" >>> FROM WEI");
  return params.web3.utils.fromWei(amount,symbol);
}
