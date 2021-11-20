module.exports = async (blockNumber, params) => {
  return params.web3.eth.getBlock(blockNumber)
}
