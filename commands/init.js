const fs = require('fs')
const path = require('path')

let copyRecursiveSync = function(src, dest) {
  var exists = fs.existsSync(src);
  var stats = exists && fs.statSync(src);
  var isDirectory = exists && stats.isDirectory();
  if (exists && isDirectory) {
    fs.mkdirSync(dest);
    fs.readdirSync(src).forEach(function(childItemName) {
      copyRecursiveSync(path.join(src, childItemName),
                        path.join(dest, childItemName));
    });
  } else {
    fs.linkSync(src, dest);
  }
};

module.exports = (params)=>{
  let ignore = params.fs.readFileSync(__dirname+"/../templates/gitignore").toString()
  if(!params.fs.existsSync(".gitignore")) {
    console.log("Adding .gitignore")
    params.fs.writeFileSync(".gitignore",ignore);
  }

  console.log("Creating config file: clevis.json")
  let init = params.fs.readFileSync(__dirname+"/../templates/config.json").toString()
  params.fs.writeFileSync("clevis.json",init);

  //installing node module locally//
  console.log("Installing clevis (this will take a while to compile)...")
  const { exec } = require('child_process')
  exec('rm -rf node_modules/clevis;npm install --save clevis@latest', (err, stdout, stderr) => {
    exec('clevis update', (err, stdout, stderr) => {})
  })

  console.log("Syncing default tests...")
  if(!fs.existsSync("tests")){
    copyRecursiveSync(__dirname+"/../templates/tests","tests/")
  }

  console.log("Touching contract list...")
  if(!fs.existsSync("contracts.clevis")){
    fs.writeFileSync("contracts.clevis","")
  }

  return "Clevis installed. Updating npm and current gas/eth prices..."
}
