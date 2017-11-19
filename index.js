#! /usr/bin/env node
const DEBUG = false
let params = {}
params.fs = require('fs')
const Web3 = require('web3')
params.solc = require('solc')
params.commands = {
  "help": [],
  "init": [],
  "version": [],
  "accounts": [],
  "unlock": ["accountindex"],
  "send":["amount","from","to"],
  "create": ["contractname"],
  "compile": ["contractname"],
  "deploy": ["contractname","accountindex"],
}
let command = "help"
if(process.argv[2]){ command=process.argv[2]; }
if(!params.commands[command]){
  console.log("Unknown command: "+command)
  process.exit(1)
}
let args = params.commands[command]
for(let a in args){
  if(typeof process.argv[3+parseInt(a)] == "undefined"){
    console.log("Missing argument "+(parseInt(a)+1)+" \""+args[a]+"\"")
    process.exit(1)
  }
  params[args[a]]=process.argv[3+parseInt(a)];
}
if(DEBUG) console.log("Running ["+command+"] with params:",params)
if(command!="init"){
  try{
    params.config = JSON.parse(params.fs.readFileSync("clevis.json").toString())

  }catch(e){
    console.log("Error loading clevis.json, run 'clevis init'")
    process.exit(1);
  }
  if(DEBUG) console.log("Connecting to "+params.config.provider)
  params.web3 = new Web3(new Web3.providers.HttpProvider(params.config.provider));
  params.config.gaspricegwei = params.web3.utils.toWei(""+params.config.gasprice,'gwei')
}
require(process.mainModule.filename.replace("index.js","commands/"+command+".js"))(params)
