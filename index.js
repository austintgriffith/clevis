#! /usr/bin/env node
let params = {}
params.fs = require('fs');
const Web3 = require('web3');
params.web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));
const commands = {
  "version": [],
  "compile": ["contractname"],
}
let command = "version"
if(process.argv[2]){ command=process.argv[2]; }
if(!commands[command]){
  console.log("Unknown command: "+command)
  process.exit(1)
}
let args = commands[command]

for(let a in args){
  if(typeof process.argv[3+parseInt(a)] == "undefined"){
    console.log("Missing argument "+(parseInt(a)+1)+" \""+args[a]+"\"")
    process.exit(1)
  }
  params[args[a]]=process.argv[3+parseInt(a)];
}
require(process.mainModule.filename.replace("index.js","commands/"+command+".js"))(params);
