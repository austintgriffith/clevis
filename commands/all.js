const Mocha = require('mocha-parallel-tests').default // or `const Mocha = require('mocha-parallel-tests').default` if you're using CommonJS
const fs = require('fs');


/*
    this is a little test script I'm working on

    I was thinking I could make something that would chew all the cpu up and compile every single contract at once

    turns out it takes just as long

 */

let compileFileContents = (file)=>{
  return `
const clevis = require("clevis")
const colors = require('colors')
const chai = require("chai")
const assert = chai.assert
const expect = chai.expect;
const should = chai.should();
describe('#compile() ${file}', function() {
  it('should compile ${file} contract to bytecode', async function() {
    this.timeout(90000)
    let contract = "${file}"
    const result = await clevis("compile",contract)
    console.log(result)
    assert(Object.keys(result.contracts).length>0, "No compiled contacts found.")
    let count = 0
    for(let c in result.contracts){
      console.log("\t\t"+"contract "+c.blue+": ",result.contracts[c].bytecode.length)
      if(count++==0){
          assert(result.contracts[c].bytecode.length > 1, "No bytecode for contract "+c)
      }
    }
  });
});

  `;
}


module.exports = (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> COMPILE ALL ")
  let files = fs.readdirSync(".")
  const mocha = new Mocha()
  files.forEach(file => {
    if(file!=".."&&file!="."&&fs.statSync(file).isDirectory()){
      let subfiles = fs.readdirSync(file)
      if(subfiles){
        subfiles.forEach(subfile => {
          if(subfile){
            if(subfile.indexOf(".sol")>0){
              //console.log(file+" ==> "+subfile);
              let testpath = "tests/compile/"+subfile+".js"
              fs.writeFileSync(testpath,compileFileContents(file))
              mocha.addFile(testpath)
            }
          }
        })
      }
    }
  })
  mocha.run();
}
