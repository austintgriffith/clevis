module.exports = (params)=>{
  let startSeconds = new Date().getTime() / 1000
  let contractname = params["contractname"];
  console.log("Compiling "+contractname+"/"+contractname+".sol ["+params.solc.version()+"]...")
  const input = params.fs.readFileSync(contractname+"/"+contractname+'.sol')
  if(!input){
    console.log("Couldn't load "+contractname+"/"+contractname+".sol")
  }else{
    let dependencies
    try{
      let path = process.cwd()+"/"+contractname+"/dependencies.js"
      if(params.fs.existsSync(path)){
        console.log("File exists")
        console.log("looking for dependencies at ",path)
        let dependencies = require(path)
      }
    }catch(e){console.log(e)}
    if(!dependencies) dependencies={}
    dependencies[contractname+"/"+contractname+".sol"] = params.fs.readFileSync(contractname+"/"+contractname+".sol", 'utf8');
    const output = params.solc.compile({sources: dependencies}, 1);
    console.log(output)
    const bytecode = output.contracts[contractname+"/"+contractname+".sol:"+contractname].bytecode;
    const abi = output.contracts[contractname+"/"+contractname+".sol:"+contractname].interface;
    params.fs.writeFile(contractname+"/"+contractname+".bytecode",bytecode)
    params.fs.writeFile(contractname+"/"+contractname+".abi",abi)
    console.log("Compiled!")
  }
}
