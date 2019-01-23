module.exports = (hash, params) => {
  return params.web3.eth.getTransaction(hash)
}
