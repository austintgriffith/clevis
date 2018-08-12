const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')

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

module.exports = async (params)=>{
  let ignore = params.fs.readFileSync(__dirname+"/../templates/gitignore").toString()
  if(!params.fs.existsSync(".gitignore")) {
    console.log("Adding .gitignore")
    params.fs.writeFileSync(".gitignore",ignore);
  }

  let craResult = await cra(true);
  console.log(craResult)

  console.log("Creating config file: clevis.json")
  let init = params.fs.readFileSync(__dirname+"/../templates/config.json").toString()
  params.fs.writeFileSync("clevis.json",init);

  //installing node module locally//
  console.log("Installing clevis (this will take a while to compile)...")

  exec('rm -rf node_modules/clevis;npm install --save clevis@latest;npm install --save s3;git clone https://github.com/OpenZeppelin/openzeppelin-solidity.git;cd openzeppelin-solidity git pull', (err, stdout, stderr) => {
    exec('clevis update', (err, stdout, stderr) => {})
  }).stdout.on('data', function(data) {
      console.log(data);
  });

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

function cra(DEBUG) {
  return new Promise((resolve, reject) => {
    if(fs.existsSync("./src")){
      resolve("Skipping CRA, src exists...")
    }else{
      let reactAction = exec('npx create-react-app .;npm i;rm -rf src;npm install --save dapparatus;npm i mocha;sudo npm link mocha;', (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          reject(err);
          return;
        }
        copyRecursiveSync(__dirname+"/../templates/src","src")
        resolve(`${stdout}`);
      })
      reactAction.stdout.on('data', function(data) {
          console.log(data);
      });
    }


  })
}
