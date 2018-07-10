const DEBUG = false
let params = {}
params.fs = require('fs')
params.commands = {
  "help": [],
  "explain": ["contractname"],
  "init": [],
  "version": [],
  "update": [],
  "accounts": [],
  "unlock": ["accountindex"],
  "send":["amount","fromindex","toindex"],
  "sendTo":["amount","fromindex","toaddress"],
  "balance":["address"],
  "sign":["string","accountindex","password"],
  "recover":["string","signature"],
  "sendData":["amount","fromindex","toaddress","data"],
  "create": ["contractname"],
  "compile": ["contractname"],
  "all": [], //this is a test script that is supposed to compile all at once but it didn't really work
  "deploy": ["contractname","accountindex"],
  "contract": ["scriptname","contractname"],
  "test": ["testname"],
  "wei": ["amount","symbol"],
  "hex": ["asciistring"],
  "ascii": ["hexstring"],
  "block": ["blocknumber"],
  "blockNumber": [],
  "transaction": ["hash"]
}
module.exports = (...args)=>{
  params.args=args
  let command = "help"
  if(args[0]){ command=args[0]}
  if(!params.commands[command]){
    console.log("Unknown command: "+command)
    return
  }
  let reqargs = params.commands[command]
  for(let a in reqargs){
    if(typeof args[1+parseInt(a)] == "undefined"){
      console.log("Missing argument "+(parseInt(a)+1)+" \""+reqargs[a]+"\"")
      return
    }
    params[reqargs[a]]=args[1+parseInt(a)];
  }
  if(DEBUG) console.log("Running ["+command+"]")
  if(command!="init"){
    try{
      params.config = JSON.parse(params.fs.readFileSync("clevis.json").toString())
    }catch(e){
      console.log("Error loading clevis.json, run 'clevis init'")
      process.exit(1);
    }
    if(DEBUG) console.log("Connecting to "+params.config.provider)
    let Web3 = require('web3')
    params.web3 = new Web3(new Web3.providers.HttpProvider(params.config.provider));
    params.config.gaspricegwei = params.web3.utils.toWei(""+Math.round(params.config.gasprice*1000)/1000,'gwei')
  }
  //let path = process.mainModule.filename.replace("index.js","commands/"+command+".js");
  let path = "./commands/"+command+".js"
  return require(path)(params)
}
