const fs = require('fs')
const winston = require('winston')
const { exec } = require('child_process');

//TODO: Needs a cleanup
module.exports = (contractName, proxyContractName, params)=>{
  //console.log("params",params)
  params.solc = require('solc')
  params.linker = require('solc/linker')
  let startSeconds = new Date().getTime() / 1000
  const contractFolder = `${params.config.CONTRACTS_FOLDER}/${contractName}`;
  winston.debug("Compiling "+contractName+"/"+contractName+".sol ["+params.solc.version()+"]...")
  const input = fs.readFileSync(`${contractFolder}/${contractName}.sol`)
  if(!input){
    console.log(`${contractFolder}/${contractName}.sol`)
  }else{
    let dependencies
    try{
      let path = `${process.cwd()}/${contractFolder}/dependencies.js`
      if(fs.existsSync(path)){
        winston.debug("File exists")
        winston.debug(`looking for dependencies at ${path}`)
        dependencies = require(path)
      }
    }catch(e){console.log(e)}
    if(!dependencies) dependencies={}
    dependencies[contractName+".sol"] = {content: fs.readFileSync(contractFolder+"/"+contractName+".sol", 'utf8')};
    console.log(" 📦 Loaded dependencies...")

    let finalCode = loadInImportsForEtherscan(input,simplifyDeps(dependencies),{});
    fs.writeFileSync(process.cwd()+ "/" +contractFolder + "/"+contractName+".compiled",finalCode)

    console.log(" 🛠️  Compiling...")
    let solcObject = {
      language: 'Solidity',
      sources: dependencies,
      settings: {
        outputSelection: {
              '*': {
                  '*': [ '*' ]
              }
        },
      }
    }

    let libraries = {}
    for(let s in solcObject.sources){
      if(s!=contractName+".sol"){
        let lines = solcObject.sources[s].content.split("\n")
        for(let l in lines){
          let libraryName = s.replace(".sol","")
          if(lines[l].indexOf("library "+libraryName)==0){
            console.log(" 📚 Adding library "+libraryName+"...")
            libraries[libraryName+'.sol:'+libraryName] = fs.readFileSync(process.cwd()+"/"+contractFolder+"/../"+libraryName+"/"+libraryName+".address").toString()
          }
        }
      }
    }

    //console.log("solcObject",solcObject)
    const output = JSON.parse(params.solc.compile(JSON.stringify(solcObject)));

    //console.log("output",output)

    //console.log("OUTPUT:",output)
    if(!output.contracts||!output.contracts[contractName+".sol"]|| (output.errors&&output.errors[0]&&output.errors[0].severity=="error")  ) {
      //console.log(output)
      //console.log("⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️ ERROR compiling!")
      reportOutput(output,params)
      return false;
    }
    winston.debug(output)
    console.log(" 💾 Saving output...")

    let compiledContractObject = output.contracts[contractName+".sol"][contractName]

    //console.log("compiledContractObject",compiledContractObject)

    if(!compiledContractObject || !compiledContractObject.evm ) {
      //console.log(output)
      //console.log("⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️ ERROR compiling!")
      console.log(" 🛑 Missing Contract "+contractName+"")
      return false;
    }

    let bytecode = compiledContractObject.evm.bytecode.object;
    let abi = JSON.stringify(compiledContractObject.abi);

    //console.log("libraryReplacementAddresses",libraryReplacementAddresses)
    bytecode = params.linker.linkBytecode( bytecode , libraries)

    //console.log("bytecode after linker",bytecode)

    //console.log("Writing bytecode to ",process.cwd()+"/"+contractFolder+"/"+contractName+".bytecode")
    fs.writeFileSync(process.cwd()+"/"+contractFolder+"/"+contractName+".bytecode",bytecode)


    if(proxyContractName){
      console.log(" 📑 Adding Proxy Contract "+proxyContractName.blue+" abi...")
      winston.debug("Loading current abi...")
      let currentAbi = JSON.parse(abi)
      winston.debug("Loading proxy abi...")
      let proxyContract = JSON.parse(fs.readFileSync(process.cwd()+"/"+contractFolder+"/../"+proxyContractName+"/"+proxyContractName+".abi").toString())
      for(let i in proxyContract){
        if(proxyContract[i].type=="function"){
          winston.debug("Adding function "+proxyContract[i].name+" to this abi so proxy calls will work...")
          currentAbi.push(proxyContract[i])
        }
      }
      abi = JSON.stringify(currentAbi)
    }



    fs.writeFileSync(process.cwd()+"/"+contractFolder+"/"+contractName+".abi",abi)
    winston.debug("Compiled!")



    let abiObject = JSON.parse(abi)
    winston.debug("Generating Getters, Setters, and Events...")
    winston.debug(abiObject)
    for(let i in abiObject){
      if(abiObject[i].type=="event"){
        let eventCode = fs.readFileSync(__dirname+"/../templates/event.js").toString()
        eventCode = eventCode.split("##contract##").join(contractName);
        eventCode = eventCode.split("##event##").join(abiObject[i].name);
        winston.debug(`Adding event: ${abiObject[i].name}`)
        let dir = process.cwd()+"/"+contractFolder+"/.clevis/";
        if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
        }
        fs.writeFileSync(dir+"event"+abiObject[i].name+".js",eventCode)
      }else if(abiObject[i].type=="function"){
        if(abiObject[i].constant){
          let getterCode = fs.readFileSync(__dirname+"/../templates/getter.js").toString()
          getterCode = getterCode.split("##contract##").join(contractName);
          getterCode = getterCode.split("##method##").join(abiObject[i].name);
          //no inputs for now, I'll have to code this up
          let inputs = ""
          let inputCount = 1
          for(let o in abiObject[i].inputs){
            winston.debug(` with input ${abiObject[i].inputs[o]}`)
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

          winston.debug(`Adding getter :${abiObject[i].name}`)
          let results = ""

          let dir = process.cwd()+"/"+contractFolder+"/.clevis/";
          if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
          }
          fs.writeFileSync(dir+abiObject[i].name+".js",getterCode)
        }else{
          let setterCode
          let argCount
          if(abiObject[i].payable){
            setterCode = fs.readFileSync(__dirname+"/../templates/setterPayable.js").toString()
            argCount = 5
          }else{
            setterCode = fs.readFileSync(__dirname+"/../templates/setter.js").toString()
            argCount = 4
          }

          setterCode = setterCode.split("##contract##").join(contractName);
          setterCode = setterCode.split("##method##").join(abiObject[i].name);
          winston.debug(`Adding setter: ${abiObject[i].name}`)

          let args = ""
          let argstring = ""
          let hintargs = ""
          for(let a in abiObject[i].inputs){
            winston.debug(` with arg ${abiObject[i].inputs[a]}`)
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
          if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
          }
          fs.writeFileSync(dir+abiObject[i].name+".js",setterCode)
        }
      }
    }
    //console.log("✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅")

    reportOutput(output,params)
    winston.debug("Compile Contract: "+contractName)
    return true;
  }
}

function reportOutput(output,params){
  let edited = false
  for(let c in output.contracts){
    console.log(" ✅ ",c)
  }
  for(let e in output.errors){
    if(output.errors[e].severity == "warning"){
      console.log(" ⚠️ ",output.errors[e].formattedMessage)
    }else if(output.errors[e].severity == "error"){
      console.log(" 🛑",output.errors[e].formattedMessage)
      if(params.config.editor&&!edited){
        edited=true;
        let fileAndLink = output.errors[e].formattedMessage.substring(0,output.errors[e].formattedMessage.indexOf(" ")-1)
        console.log(" ✏️  Editing "+fileAndLink)
        let folder = fileAndLink.substring(0,fileAndLink.indexOf(".sol"))
        let contractAt = params.config.CONTRACTS_FOLDER+"/"+folder+"/"+fileAndLink
        //if (!fs.existsSync(contractAt)) {
        //  contractAt = params.config.CONTRACTS_FOLDER+"/"+fileAndLink
        //}
        let cmd = params.config.editor+" "+contractAt
        exec(cmd)
      }

    }else{
      console.log(output.errors[e])
    }
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
            finalCode+=dependencies[d].content+"\n";
          }
        }
      }
      if(!found){
        console.log("⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️⛔️ ERROR, failed to load in dependency for ",thisLine);
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
