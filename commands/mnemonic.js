const fs = require("fs")
const winston = require('winston')

module.exports = async (params) => {
  return generateViaMnemonic()
}

function generateViaMnemonic() {

    let result = require("bip39").generateMnemonic()

    return result
  
}
