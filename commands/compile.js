module.exports = (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> COMPILE")
  let startSeconds = new Date().getTime() / 1000
  let contractname = params["contractname"];
  if(DEBUG) console.log("Compiling "+contractname+"/"+contractname+".sol ["+params.solc.version()+"]...")
  const input = params.fs.readFileSync(contractname+"/"+contractname+'.sol')
  if(!input){
    console.log("Couldn't load "+contractname+"/"+contractname+".sol")
  }else{
    let dependencies
    try{
      let path = process.cwd()+"/"+contractname+"/dependencies.js"
      if(params.fs.existsSync(path)){
        if(DEBUG) console.log("File exists")
        if(DEBUG) console.log("looking for dependencies at ",path)
        dependencies = require(path)
      }
    }catch(e){console.log(e)}
    if(!dependencies) dependencies={}
    dependencies[contractname+"/"+contractname+".sol"] = params.fs.readFileSync(contractname+"/"+contractname+".sol", 'utf8');
    const output = params.solc.compile({sources: dependencies}, 1);
    if(!output.contracts||!output.contracts[contractname+"/"+contractname+".sol:"+contractname]) return output;
    if(DEBUG) console.log(output)
    const bytecode = output.contracts[contractname+"/"+contractname+".sol:"+contractname].bytecode;
    const abi = output.contracts[contractname+"/"+contractname+".sol:"+contractname].interface;
    params.fs.writeFileSync(process.cwd()+"/"+contractname+"/"+contractname+".bytecode",bytecode)
    params.fs.writeFileSync(process.cwd()+"/"+contractname+"/"+contractname+".abi",abi)
    if(DEBUG) console.log("Compiled!")

    let abiObject = JSON.parse(abi)
    if(DEBUG) console.log("Generating Getters, Setters, and Events...")
    if(DEBUG) console.log(abiObject)
    for(let i in abiObject){
      if(abiObject[i].type=="event"){
        let eventCode = params.fs.readFileSync(__dirname+"/../templates/event.js").toString()
        eventCode = eventCode.split("##contract##").join(params.contractname);
        eventCode = eventCode.split("##event##").join(abiObject[i].name);
        if(DEBUG) console.log("Adding event ",abiObject[i].name)
        params.fs.writeFileSync(process.cwd()+"/"+contractname+"/event"+abiObject[i].name+".js",eventCode)
      }else if(abiObject[i].type=="function"){
        if(abiObject[i].constant){
          let getterCode = params.fs.readFileSync(__dirname+"/../templates/getter.js").toString()
          getterCode = getterCode.split("##contract##").join(params.contractname);
          getterCode = getterCode.split("##method##").join(abiObject[i].name);
          //no inputs for now, I'll have to code this up
          let inputs = ""
          let inputCount = 1
          for(let o in abiObject[i].inputs){
            if(DEBUG) console.log(" with input ",abiObject[i].inputs[o])
            if(inputs!=""){
              inputs+=","
            }
            let thisInput = "args["+(inputCount+2)+"]"
            if(abiObject[i].inputs[o].type=="bytes32"){
              thisInput="params.web3.utils.fromAscii("+thisInput+")"
            }
            inputs+=thisInput
            inputCount++;
          }
          getterCode = getterCode.split("##inputs##").join(inputs);

          if(DEBUG) console.log("Adding getter ",abiObject[i].name)
          let results = ""
          let outputs = ""
          let outputCount = 1
          for(let o in abiObject[i].outputs){
            if(DEBUG) console.log(" with output ",abiObject[i].outputs[o])
            if(outputs!=""){
              outputs+=","
            }
            let thisOutput = "output"+(outputCount)
            outputs+=thisOutput
            if(results!=""){
              results+=","
            }
            if(abiObject[i].outputs[o].type=="bytes32"){
              results+="params.web3.utils.toAscii("+thisOutput+")"
            }else{
              results+=thisOutput
            }
            outputCount++;
          }
          getterCode = getterCode.split("##results##").join(results);
          getterCode = getterCode.split("##outputs##").join(outputs);
          params.fs.writeFileSync(process.cwd()+"/"+contractname+"/"+abiObject[i].name+".js",getterCode)
        }else{
          let setterCode = params.fs.readFileSync(__dirname+"/../templates/setter.js").toString()
          setterCode = setterCode.split("##contract##").join(params.contractname);
          setterCode = setterCode.split("##method##").join(abiObject[i].name);
          if(DEBUG) console.log("Adding setter ",abiObject[i].name)
          let argCount = 4
          let args = ""
          let argstring = ""
          let hintargs = ""
          for(let a in abiObject[i].inputs){
            if(DEBUG) console.log(" with arg ",abiObject[i].inputs[a])
            if(args!="") args+=","
            if(abiObject[i].inputs[a].type=="bytes32"){
              args+="params.web3.utils.fromAscii(args["+argCount+"])"
            }else{
              args+="args["+argCount+"]"
            }
            if(argstring!="") argstring+=","
            argstring += "\"+args["+argCount+"]+\""
            if(hintargs!="") hintargs+=" "
            hintargs+=""+abiObject[i].inputs[a].name
            argCount++
          }
          setterCode = setterCode.split("##args##").join(args);
          setterCode = setterCode.split("##argstring##").join(argstring);
          setterCode = setterCode.split("##hintargs##").join(hintargs);
          params.fs.writeFileSync(process.cwd()+"/"+contractname+"/"+abiObject[i].name+".js",setterCode)
        }
      }
    }
    if(DEBUG) console.log("Compile Contract: "+contractname)
    return output;
  }
}
