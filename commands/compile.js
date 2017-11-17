const fs = require("fs")
const solc = require('solc')
module.exports = (params)=>{
  let startSeconds = new Date().getTime() / 1000
  let contractname = params["contractname"];
  console.log("Compiling "+contractname+"/"+contractname+".sol ["+solc.version()+"]...")
  const input = fs.readFileSync(contractname+"/"+contractname+'.sol')
  if(!input){
    console.log("Couldn't load "+contractname+"/"+contractname+".sol")
  }else{
    let dependencies
    try{
      let path = process.cwd()+"/"+contractname+"/dependencies.js"
      if(fs.existsSync(path)){
        console.log("File exists")
        console.log("looking for dependencies at ",path)
        let dependencies = require(path)
      }
    }catch(e){console.log(e)}
    if(!dependencies) dependencies={}
    dependencies[contractname+"/"+contractname+".sol"] = fs.readFileSync(contractname+"/"+contractname+".sol", 'utf8');
    const output = solc.compile({sources: dependencies}, 1);
    console.log(output)
    const bytecode = output.contracts[contractname+"/"+contractname+".sol:"+contractname].bytecode;
    const abi = output.contracts[contractname+"/"+contractname+".sol:"+contractname].interface;
    fs.writeFile(contractname+"/"+contractname+".bytecode",bytecode)
    fs.writeFile(contractname+"/"+contractname+".abi",abi)
    console.log("Compiled!")
  }
}
