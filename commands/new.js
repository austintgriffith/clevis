const fs = require("fs")
const winston = require('winston')

module.exports = async (password = "", params) => {
  if(params.config.USE_INFURA) {
    return generateViaMnemonic()
  } else {
    return generateViaRpc(password, params)
  }
}

async function generateViaRpc(password, params) {
  try {
    return params.web3.eth.personal.newAccount(password)
  } catch(e) {
    if(e.toString().indexOf("Method not found") >= 0) {
      return false
    } else {
      throw(e)
    }
  }
}

function generateViaMnemonic() {
  let currentEnv = fs.readFileSync(".env")

  if(currentEnv.indexOf("mnemonic") >= 0) {
    winston.error("ERROR, '.env' mnemonic already exists. Will not overwrite")
    return false
  } else {
    let result = require("bip39").generateMnemonic()

    if(currentEnv) {
      currentEnv = `${currentEnv}\n`
    }

    currentEnv = `${currentEnv}mnemonic=${result}`

    fs.writeFileSync(".env", currentEnv)

    winston.debug("mnemonic created in .env!")

    return true
  }
}
