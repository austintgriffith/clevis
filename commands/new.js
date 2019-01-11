const fs = require("fs")
const winston = require('winston')

module.exports = async (password = "", params) => {
  let account = await generateViaRpc(password, params)

  if(account === false) {
    winston.warn("Method not found natively in RPC, generate a mnemonic locally...")
    account = generateViaMnemonic()
  }

  winston.debug(`Account created: ${account}`)
  return account
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
    throw("ERROR, '.env' mnemonic already exists - Try setting 'USE_INFURA: true' in clevis.json")
  } else {
    let result = require("bip39").generateMnemonic()

    if(currentEnv) {
      currentEnv = `${currentEnv}\n`
    }

    currentEnv = `${currentEnv}mnemonic=${result}`

    fs.writeFileSync(".env", currentEnv)

    winston.info("mnemonic created! Set 'USE_INFURA: true' in clevis.json to start using it.")
  }
}
