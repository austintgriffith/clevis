const DEBUG = false
let params = {}
params.fs = require('fs')
params.commands = {
  "help": [],
  "init": [],
  "init2": [],
  "version": [],
  "update": [],
  "upgrade": [],//upgrade clevis node_modules
  "accounts": [],
  "new": ["[password]"],
  "unlock": ["accountindex","password"],
  "send":["amount","fromindex","toindex"],
  "sendTo":["amount","fromindex","toaddress"],
  "balance":["address"],
  "sign":["string","accountindex","password"],
  "recover":["string","signature"],
  "sha3":["string"],
  "sendData":["amount","fromindex","toaddress","data"],
  "create": ["contractname"],
  "compile": ["contractname"],
  "deploy": ["contractname","accountindex"],
  "explain": ["contractname"],
  "contract": ["scriptname","contractname","[accountIndex]","[contractArguments...]"],
  "test": ["testname"],
  "fromwei": ["amount","symbol"],
  "towei": ["amount","symbol"],
  "tohex": ["textstring"],
  "fromhex": ["hexstring"],
  "blockNumber": [],
  "block": ["blocknumber"],
  "transaction": ["hash"],
  "build": [],//build react site
  "start": [],//start react dev site
  "upload": ["[target]"],//upload react site to bucket target or target=IPFS
  "invalidate": ["[target]"],//invalidate cloudfront
  "mocha": [],//install/update mocha
}
module.exports = (...args)=>{
  params.args=args
  let command = "help"
  if(args[0]){ command=args[0]}
  if(!params.commands[command]){
    console.log("Unknown command: "+command)
    return
  }
  let reqargArray = []
  let reqargs = params.commands[command]
  //count required args
  for(let a in reqargs){
    if(reqargs[a].indexOf("[")==0){
      //this is not required don't add it to the list
    }else{
      reqargArray.push(reqargs[a])
    }
    params[reqargs[a].replace("[","").replace("]","")]=args[1+parseInt(a)];
  }
//  console.log("reqargs",reqargs)
//  console.log("reqargArray",reqargArray)
  //console.log("params.args",params.args)

  if(typeof args[parseInt(reqargArray.length)] == "undefined"){
    console.log("Missing argument "+(reqargArray.length)+" \""+reqargArray[reqargArray.length-1]+"\"")
    return
  }

  if(DEBUG) console.log("🗜️ Clevis ["+command+"]")

  if(command!="init"){
    try{
      params.config = JSON.parse(params.fs.readFileSync("clevis.json").toString())
    }catch(e){
      console.log("Error loading clevis.json, run 'clevis init'")
      process.exit(1);
    }
    if(DEBUG) console.log("Connecting to "+params.config.provider)
    let Web3 = require('web3')
    const HDWalletProvider = require("truffle-hdwallet-provider")
    params.web3 = new Web3(
        params.config.USE_INFURA ?
        new HDWalletProvider(
          process.env.mnemonic,
          params.config.provider
        ) :
        new Web3.providers.HttpProvider(params.config.provider)
    );
    params.config.gaspricegwei = params.web3.utils.toWei(""+Math.round(params.config.gasprice*1000)/1000,'gwei')
  }
  //let path = process.mainModule.filename.replace("index.js","commands/"+command+".js");
  let path = "./commands/"+command+".js"
  return require(path)(params)
}
