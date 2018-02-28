
module.exports = (params)=>{
  let ignore = params.fs.readFileSync(__dirname+"/../templates/gitignore").toString()
  if(!params.fs.existsSync(".gitignore")) {
    console.log("Adding .gitignore")
    params.fs.writeFileSync(".gitignore",ignore);
  }

  let exampleTests = params.fs.readFileSync(__dirname+"/../templates/exampleTests.js").toString()
  if(!params.fs.existsSync("tests")||!params.fs.existsSync("tests/example.js")) {
    try{params.fs.mkdirSync("tests")}catch(e){}
    console.log("Adding example test file")
    params.fs.writeFileSync("tests/example.js",exampleTests);
  }

  console.log("Creating config file: clevis.json")
  let init = params.fs.readFileSync(__dirname+"/../templates/config.json").toString()
  params.fs.writeFileSync("clevis.json",init);

  //installing node module locally//
  console.log("Installing clevis (this will take a while to compile)...")
  const { exec } = require('child_process')
  exec('rm -rf node_modules/clevis;npm install --save clevis@latest', (err, stdout, stderr) => {})
  return init
}
