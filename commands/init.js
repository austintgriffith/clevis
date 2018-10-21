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

  let DEFAULT_craFolder = "./src"
  let DEFAULT_testsFolder = "tests"
  let DEFAULT_contractsFolder = "contracts"

  let existingConf
  try{
    existingConf = fs.readFileSync("clevis.json")
    let existing = JSON.parse(existingConf)
    if(existing.CRA_FOLDER){DEFAULT_craFolder=existing.CRA_FOLDER}
    if(existing.TESTS_FOLDER){DEFAULT_testsFolder=existing.TESTS_FOLDER}
    if(existing.CONTRACTS_FOLDER){DEFAULT_contractsFolder=existing.CONTRACTS_FOLDER}
  }catch(e){
    //do nothing, this is fine
  }

  let craFolder = await readLineAsync("Enter your react-app folder (Leave empty to create it under "+DEFAULT_craFolder+"): ");
  let testsFolder = await readLineAsync("Enter your tests folder (Leave empty to create it under "+DEFAULT_testsFolder+"): ");
  let contractsFolder = await readLineAsync("Enter your contracts folder (Leave empty to create them under "+DEFAULT_contractsFolder+"): ");

  prompts.close();
  process.stdin.destroy();

  let ignore = params.fs.readFileSync(__dirname+"/../templates/gitignore").toString()
  if(!params.fs.existsSync(".gitignore")) {
    console.log("Adding .gitignore")
    params.fs.writeFileSync(".gitignore",ignore);
  }

  console.log("Creating react app...")
  let craResult = await cra(true);
  console.log(craResult)

  process.exit()

  //patch the env file so it ignores CRA babel issues
  params.fs.writeFileSync(".env","SKIP_PREFLIGHT_CHECK=true");

  craFolder = craFolder || DEFAULT_craFolder;
  testsFolder = testsFolder || DEFAULT_testsFolder
  contractsFolder = contractsFolder || DEFAULT_contractsFolder
  console.log('Selected folder for react app:', craFolder);
  console.log('Selected testsFolder', testsFolder);

  console.log("Creating config file: clevis.json")
  let init = params.fs.readFileSync(__dirname+"/../templates/config.json").toString()
  const config = Object.assign(JSON.parse(init), {
    ROOT_FOLDER: process.cwd(),
    CRA_FOLDER: craFolder,
    TESTS_FOLDER: testsFolder,
    CONTRACTS_FOLDER: contractsFolder
  });
  console.log('contractFolder', contractsFolder);
  try{params.fs.mkdirSync(contractsFolder)}catch(e){}
  params.fs.writeFileSync("clevis.json", JSON.stringify(config));

  params.fs.writeFileSync("run.sh","#!/bin/bash\ndocker run -ti --rm --name clevis -p 3000:3000 -p 8545:8545 -v ${PWD}:/dapp austingriffith/clevis\n");
  params.fs.writeFileSync("attach.sh","#!/bin/bash\ndocker exec -ti clevis bash\n");
  params.fs.writeFileSync("stop.sh","#!/bin/bash\ndocker stop clevis\n");

  //installing node module locally//
  console.log("Installing clevis (this will take a while to compile)...")


  console.log("Installing OpenZeppelin...")
  exec(`git clone https://github.com/OpenZeppelin/openzeppelin-solidity.git;cd openzeppelin-solidity; git pull; git checkout tags/v2.0.0-rc.3`, (err, stdout, stderr) => {
    console.log("OZ:",err, stdout, stderr)
    exec(`chmod +x *.sh;npm install --save clevis@latest;npm install --save s3`, (err, stdout, stderr) => {
      console.log("Installing clevis package and updating...")
      exec('npm install clevis; clevis update; chmod +x *.sh', (err, stdout, stderr) => {}).stdout.on('data', function(data) {
          console.log(data)
      })
    }).stdout.on('data', function(data) {
        console.log(data);
    });
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
      reactAction.stderr.on('data', function(data) {
          console.log(data);
      });
    }


  })
}
