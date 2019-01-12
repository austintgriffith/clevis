let axios = require('axios')
let fs = require('fs')
const winston = require('winston')

module.exports = (params) => {
  let clevis = JSON.parse(fs.readFileSync("clevis.json").toString())
  let data = [getGasPrice(params.web3.utils.toWei), getEthPrice()]

  return Promise.all(data)
  .then(function([gas, eth]) {
    winston.debug(`New gas price: ${gas}`)
    winston.debug(`New eth price: ${eth}`)

    clevis.gasprice = gas
    clevis.ethprice = eth

    fs.writeFileSync('clevis.json', JSON.stringify(clevis, null, 2))

    return clevis
  })
}

//This function is way more verbose than needed on purpose
//The logic is not easy to understand when done as a one-liner
//Returns the gas price in wei
function getGasPrice(toWei) {
  return axios.get("https://ethgasstation.info/json/ethgasAPI.json").then(response => {
    //ethgasstation returns 10x the actual average for some odd reason
    let actualAverage = response.data.average / 10
    winston.debug(`gas price actualAverage: ${actualAverage}`)

    //We want to just add a bit more than average to be speedy
    let safeAmount = actualAverage + 0.1
    winston.debug(`gas price safeAmount: ${safeAmount}`)

    //We want to round to the tenthousandth precision
    let rounded = Math.round(safeAmount * 10000) / 10000
    winston.debug(`gas price rounded: ${rounded}`)

    //Lets save the gas price in wei, rather than gwei, since that is how web3 expects it.
    let wei = toWei(`${rounded}`, 'gwei')
    winston.debug(`gas price wei: ${wei}`)

    return parseInt(wei)
  })
}

function getEthPrice() {
  return axios.get("https://api.coinmarketcap.com/v2/ticker/1027/").then(response => {
    return response.data.data.quotes.USD.price
  })
}
