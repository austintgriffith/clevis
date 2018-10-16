const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const reader = require('readline')

const prompts = reader.createInterface(process.stdin, process.stdout);

function readLineAsync(message) {
  return new Promise((resolve, reject) => {
    prompts.question(message, (answer) => {
      resolve(answer);
    });
  });
}

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
    //fs.copySync(src, dest);
    fs.createReadStream(src).pipe(fs.createWriteStream(dest));
  }
};

module.exports = async (params)=>{
  let ignore = params.fs.readFileSync(__dirname+"/../templates/gitignore").toString()
  if(!params.fs.existsSync(".gitignore")) {
    console.log("Adding .gitignore")
    params.fs.writeFileSync(".gitignore",ignore);
  }
  let craFolder = await readLineAsync("Enter your react-app folder (Leave empty to create it under ./src): ");
  let testsFolder = await readLineAsync("Enter your tests folder (Leave empty to create it under tests): ");
  let contractsFolder = await readLineAsync("Enter your contracts parent folder (Leave empty to create them under ./): ");
  craFolder = craFolder || "./src";
  testsFolder = testsFolder || "tests/"
  contractsFolder = contractsFolder || "./"
  console.log('Selected folder for react app:', craFolder);
  console.log('Selected testsFolder', testsFolder);
  let craResult = await cra(true, craFolder);
  console.log(craResult)

  console.log("Creating config file: clevis.json")
  let init = params.fs.readFileSync(__dirname+"/../templates/config.json").toString()
  const config = Object.assign(JSON.parse(init), {
    ROOT_FOLDER: process.cwd(),
    CRA_FOLDER: craFolder,
    TESTS_FOLDER: testsFolder,
    CONTRACTS_FOLDER: contractsFolder
  });
  params.fs.writeFileSync("clevis.json", JSON.stringify(config));

  params.fs.writeFileSync("run.sh","#!/bin/bash\ndocker run -ti --rm --name clevis -p 3000:3000 -p 8545:8545 -v ${PWD}:/dapp austingriffith/clevis\n");
  params.fs.writeFileSync("attach.sh","#!/bin/bash\ndocker exec -ti clevis bash\n");
  params.fs.writeFileSync("stop.sh","#!/bin/bash\ndocker stop clevis\n");

  //installing node module locally//
  console.log("Installing clevis (this will take a while to compile)...")

  exec(`chmod +x *.sh;npm install --save clevis@latest;npm install --save s3;cd ${contractsFolder}/..;git clone https://github.com/OpenZeppelin/openzeppelin-solidity.git;cd openzeppelin-solidity; git pull`, (err, stdout, stderr) => {
    exec('clevis update', (err, stdout, stderr) => {}).stdout.on('data', function(data) {
        console.log(data)
    })
  }).stdout.on('data', function(data) {
      console.log(data);
  });
  // .stderr.on('data', function(data) {
  //     console.log(data);
  // });

  console.log("Syncing default tests...")
  if(!fs.existsSync(testsFolder)){
    copyRecursiveSync(__dirname+"/../templates/tests",testsFolder)
  }

  console.log("Touching contract list...")
  if(!fs.existsSync("contracts.clevis")){
    fs.writeFileSync("contracts.clevis","")
  }

  return "Updating Clevis, S3, Mocha, OpenZeppelin, and current gas/eth prices..."
}

function cra(DEBUG, craFolder='./src') {
  return new Promise((resolve, reject) => {
    if(fs.existsSync(craFolder)){
      resolve("Skipping CRA, src exists...")
    }else{
      console.log("Installing specific version of CRA...")
      let reactAction = exec('npx create-react-app@1.5.2 .;npm i;rm -rf src;npm install --save dapparatus;npm i mocha;sudo npm link mocha;', (err, stdout, stderr) => {
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
      reactAction.stderr.on('data', function(data) {
          console.log(data);
      });
    }


  })
}
