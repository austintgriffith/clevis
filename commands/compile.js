module.exports = (params)=>{
  params.solc = require('solc')
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> COMPILE")
  let startSeconds = new Date().getTime() / 1000
  let contractname = params["contractname"];
  const contractFolder = `${params.config.CONTRACTS_FOLDER}/${contractname}`;
  if(DEBUG) console.log("Compiling "+contractname+"/"+contractname+".sol ["+params.solc.version()+"]...")
  const input = params.fs.readFileSync(`${contractFolder}/${contractname}.sol`)
  if(!input){
    console.log(`${contractFolder}/${contractname}.sol`)
  }else{
    let dependencies
    try{
      let path = `${process.cwd()}/${contractFolder}/dependencies.js`
      if(params.fs.existsSync(path)){
        if(DEBUG) console.log("File exists")
        if(DEBUG) console.log("looking for dependencies at ",path)
        dependencies = require(path)
      }
    }catch(e){console.log(e)}
    if(!dependencies) dependencies={}
    dependencies[contractname+".sol"] = {content: params.fs.readFileSync(contractFolder+"/"+contractname+".sol", 'utf8')}
    console.log("Loaded dependencies...")

    let finalCode = loadInImportsForEtherscan(input,simplifyDeps(dependencies),{});
    params.fs.writeFileSync(process.cwd()+ "/" +contractFolder + "/"+contractname+".compiled",finalCode)

    var compilerInput = {
      language: 'Solidity',
      sources: dependencies,
      settings: {
        outputSelection: {
          '*': {
            '*': [ '*' ]
          }
        }
      }
    }
  
    console.log("Compiling...")
    const output = JSON.parse(params.solc.compile(JSON.stringify(compilerInput)))
    if(!output.contracts||!output["contracts"][contractname+".sol"]) {
      console.log("ERROR compiling!",output.contracts)
      return output;
    }
    if(DEBUG) console.log(output)
    console.log("Saving output...")

    const outputContract = output.contracts[contractname+".sol"]
    //hack: assuming only one contract per .sol source file
    const firstCompiledContract = outputContract[Object.keys(outputContract)[0]]
    const bytecode = firstCompiledContract.evm.bytecode.object
    const abiObject = firstCompiledContract.abi
    console.log("Writing bytecode to ",process.cwd()+"/"+contractFolder+"/"+contractname+".bytecode    ")
    params.fs.writeFileSync(process.cwd()+"/"+contractFolder+"/"+contractname+".bytecode",bytecode)
    params.fs.writeFileSync(process.cwd()+"/"+contractFolder+"/"+contractname+".abi",JSON.stringify(abiObject))
    if(DEBUG) console.log("Compiled!")

    if(DEBUG) console.log("Generating Getters, Setters, and Events...")
    if(DEBUG) console.log(abiObject)
    for(let i in abiObject){
      if(abiObject[i].type=="event"){
        let eventCode = params.fs.readFileSync(__dirname+"/../templates/event.js").toString()
        eventCode = eventCode.split("##contract##").join(params.contractname);
        eventCode = eventCode.split("##event##").join(abiObject[i].name);
        if(DEBUG) console.log("Adding event ",abiObject[i].name)
        let dir = process.cwd()+"/"+contractFolder+"/.clevis/";
        if (!params.fs.existsSync(dir)){
          params.fs.mkdirSync(dir);
        }
        params.fs.writeFileSync(dir+"event"+abiObject[i].name+".js",eventCode)
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
            //if(abiObject[i].inputs[o].type=="bytes32"){
            //  thisInput="params.web3.utils.fromAscii("+thisInput+")"
            //}
            inputs+=thisInput
            inputCount++;
          }
          getterCode = getterCode.split("##inputs##").join(inputs);

          if(DEBUG) console.log("Adding getter ",abiObject[i].name)
          let results = ""

          let dir = process.cwd()+"/"+contractFolder+"/.clevis/";
          if (!params.fs.existsSync(dir)){
            params.fs.mkdirSync(dir);
          }
          params.fs.writeFileSync(dir+abiObject[i].name+".js",getterCode)
        }else{
          let setterCode
          let argCount
          if(abiObject[i].payable){
            setterCode = params.fs.readFileSync(__dirname+"/../templates/setterPayable.js").toString()
            argCount = 5
          }else{
            setterCode = params.fs.readFileSync(__dirname+"/../templates/setter.js").toString()
            argCount = 4
          }

          setterCode = setterCode.split("##contract##").join(params.contractname);
          setterCode = setterCode.split("##method##").join(abiObject[i].name);
          if(DEBUG) console.log("Adding setter ",abiObject[i].name)

          let args = ""
          let argstring = ""
          let hintargs = ""
          for(let a in abiObject[i].inputs){
            if(DEBUG) console.log(" with arg ",abiObject[i].inputs[a])
            if(args!="") args+=","
            //if(abiObject[i].inputs[a].type=="bytes32"){
            //  args+="params.web3.utils.fromAscii(args["+argCount+"])"
            //}else{
            if(abiObject[i].inputs[a].type=="bool"){
              args+="(args["+argCount+"]===\"true\")"
            }else{
              args+="args["+argCount+"]"
            }
            //}
            if(argstring!="") argstring+=","
            argstring += "\"+args["+argCount+"]+\""
            if(hintargs!="") hintargs+=" "
            hintargs+=""+abiObject[i].inputs[a].name
            argCount++
          }
          setterCode = setterCode.split("##args##").join(args);
          setterCode = setterCode.split("##argstring##").join(argstring);
          setterCode = setterCode.split("##hintargs##").join(hintargs);
          let dir = process.cwd()+"/"+contractFolder+"/.clevis/";
          if (!params.fs.existsSync(dir)){
            params.fs.mkdirSync(dir);
          }
          params.fs.writeFileSync(dir+abiObject[i].name+".js",setterCode)
        }
      }
    }
    if(DEBUG) console.log("Compile Contract: "+contractname)
    return output;
  }
}

function simplifyDeps(dependencies){
  let simpleDeps = {};
  for(let d in dependencies){
    let foundSlash = d.lastIndexOf("/");
    if(foundSlash>=0){
      cleanD=d.substring(foundSlash+1)
    }else{
      cleanD=d;
    }
    simpleDeps[cleanD] = dependencies[d];
  }
  return simpleDeps;
}


function loadInImportsForEtherscan(input,dependencies,broughtInDep){
  let finalCode = "";
  let splitSourceCode = input.toString().split("\n");
  for(let line in splitSourceCode){
    let thisLine = splitSourceCode[line]
    if(thisLine.indexOf("import")>=0){
      thisLine = cleanImport(thisLine)
      let found = false
      for(let d in dependencies){
        if(thisLine==d){
          found=true;
          //finalCode+=loadInImportsForEtherscan(dependencies[d],dependencies)+"\n";
          if(!broughtInDep[d]){
            broughtInDep[d]=true;
            finalCode+=dependencies[d]+"\n";
          }
        }
      }
      if(!found){
        console.log("ERROR, failed to load in dependency for ",thisLine);
        process.exit(1);
      }
    }else{
      finalCode+=thisLine+"\n";
    }
  }

  let cleanRedundant = ""
  let foundPragma = false
  let foundImports = {}
  let splitSourceCodeAgain = finalCode.toString().split("\n")
  for(let line in splitSourceCodeAgain){
    let thisLineAgain = splitSourceCodeAgain[line]
    //console.log("LINE:",thisLineAgain)
    if(thisLineAgain.indexOf("pragma")>=0){
      if(!foundPragma){
        foundPragma=true;
        cleanRedundant+=thisLineAgain+"\n";
      }else{
        //skip this line, we already have the pragma
      }
    }else{
      if(thisLineAgain.indexOf("import")>=0){

        let cleanedThisLineAgain = cleanImport(thisLineAgain)
        if(!foundImports[cleanedThisLineAgain]){
          cleanRedundant+=thisLineAgain+"\n";
          foundImports[cleanedThisLineAgain]=true;
        }else{
          //skip
        }
      }else{
        cleanRedundant+=thisLineAgain+"\n";
      }
    }
  }

  if(cleanRedundant.indexOf("import")>=0){
    return loadInImportsForEtherscan(cleanRedundant,dependencies,broughtInDep);
  }else{
    return cleanRedundant;
  }
}

function cleanImport(thisLine){
  thisLine = thisLine.split("import").join("")
  thisLine = thisLine.split("\r").join("")
  thisLine = thisLine.split("\"").join("")
  thisLine = thisLine.split("'").join("")
  thisLine = thisLine.split(";").join("")
  thisLine = thisLine.split(" ").join("")
  let foundSlash = thisLine.lastIndexOf("/");
  if(foundSlash>=0){
    thisLine=thisLine.substring(foundSlash+1)
  }
  return thisLine;
}
