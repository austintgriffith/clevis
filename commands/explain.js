module.exports = (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> EXPLAIN "+  params.contractname)
  let readAbi = JSON.parse(params.fs.readFileSync(process.cwd()+"/"+params.contractname+"/"+params.contractname+".abi").toString().trim())
  let output = ""
  for(let i in readAbi){
    let payable = ""
    if(readAbi[i].payable){
      payable = " ((payable)) "
    }
    let constant = ""
    if(readAbi[i].constant){
      constant = " [[constant]] "
    }
    let name = ""
    if(readAbi[i].name){
      name = readAbi[i].name
    }
    let sm = ""
    if(readAbi[i].stateMutability){
      sm = " ("+readAbi[i].stateMutability+")"
    }
    output += ("("+readAbi[i].type+") "+name+" "+payable+constant+sm+"")+"\n"
    if(readAbi[i].type!="event"){
      let inputs = "\tinputs: \t"
      let areIn = false
      for(let j in readAbi[i].inputs)
      {
        areIn=true
        if(j>0) inputs+=", "
        inputs+=readAbi[i].inputs[j].type+" "+readAbi[i].inputs[j].name
      }
      if(areIn) output += (inputs)+"\n"
      let outputs = "\toutputs:\t"
      let areOut = false
      for(let j in readAbi[i].outputs)
      {
        //console.log(readAbi[i].outputs[j])
        let indexed = ""
        areOut=true
        if(readAbi[i].outputs[j].indexed){
          indexed = " [[indexed]]"
        }
        if(j>0) outputs+=", "
        outputs+=readAbi[i].outputs[j].type+" "+readAbi[i].outputs[j].name+""+indexed
      }
      if(areOut) output += (outputs) +"\n"
    }else{
      let inputs = "\tfields: \t"
      let areIn = false
      for(let j in readAbi[i].inputs)
      {
        let indexed = ""
        if(readAbi[i].inputs[j].indexed){
          indexed = " (indexed)"
        }
        areIn=true
        if(j>0) inputs+=", "
        inputs+=readAbi[i].inputs[j].type+indexed+" "+readAbi[i].inputs[j].name
      }
      if(areIn) output += (inputs)+"\n"
    }

    output+="\n"
  }

  return output;

}
