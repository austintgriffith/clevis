module.exports = (params)=>{
  let ignore = params.fs.readFileSync(__dirname+"/../templates/gitignore").toString()
  if(!params.fs.existsSync(".gitignore")) {
    console.log("Adding .gitignore")
    params.fs.writeFileSync(".gitignore",ignore);
  }

  let accountTest = params.fs.readFileSync(__dirname+"/../templates/accountTest.js").toString()
  if(!params.fs.existsSync("tests")||!params.fs.existsSync("tests/account.js")) {
    try{params.fs.mkdirSync("tests")}catch(e){}
    console.log("Adding example test file")
    params.fs.writeFileSync("tests/account.js",accountTest);
  }

  console.log("Creating config file: clevis.json")
  let init = params.fs.readFileSync(__dirname+"/../templates/config.json").toString()
  params.fs.writeFileSync("clevis.json",init);

  return init
}
