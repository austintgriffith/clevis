module.exports = (amount, symbol, params) => {
  return params.web3.utils.fromWei(amount,symbol);
}
