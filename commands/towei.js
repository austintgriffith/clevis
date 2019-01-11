module.exports = (amount, symbol, params) => {
  return params.web3.utils.toWei(amount, symbol);
}
