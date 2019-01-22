const fs = require('fs')
const path = require('path')
const { exec } = require('child_process')
const reader = require('readline')
const prompts = reader.createInterface(process.stdin, process.stdout);

module.exports = async () => {
  let DEFAULT_craFolder = "./src"
  let DEFAULT_testsFolder = "tests"
  let DEFAULT_contractsFolder = "contracts"
  let DEFAULT_provider = "http://localhost:8545"
  let DEFAULT_useinfura = false

  let existingConf
  try{
    existingConf = fs.readFileSync("clevis.json")
    let existing = JSON.parse(existingConf)
    if(existing.CRA_FOLDER){DEFAULT_craFolder=existing.CRA_FOLDER}
    if(existing.TESTS_FOLDER){DEFAULT_testsFolder=existing.TESTS_FOLDER}
    if(existing.CONTRACTS_FOLDER){DEFAULT_contractsFolder=existing.CONTRACTS_FOLDER}
    if(existing.provider){DEFAULT_provider=existing.provider}
    if(existing.USE_INFURA){DEFAULT_useinfura=existing.USE_INFURA}
  }catch(e){
    //do nothing, this is fine
  }

  let craFolder = await readLineAsync("Enter your react-app folder (Leave empty to create it under "+DEFAULT_craFolder+"): ");
  let testsFolder = await readLineAsync("Enter your tests folder (Leave empty to create it under "+DEFAULT_testsFolder+"): ");
  let contractsFolder = await readLineAsync("Enter your contracts folder (Leave empty to create them under "+DEFAULT_contractsFolder+"): ");

  prompts.close();
  process.stdin.destroy();

  let ignore = fs.readFileSync(__dirname+"/../templates/gitignore").toString()
  if(!fs.existsSync(".gitignore")) {
    console.log("Adding .gitignore")
    fs.writeFileSync(".gitignore",ignore);
  }

  console.log("Creating react app...")
  let craResult = await cra();
  console.log(craResult)

  if(!fs.existsSync(".env")) {
    //patch the env file so it ignores CRA babel issues
    fs.writeFileSync(".env","SKIP_PREFLIGHT_CHECK=true");
  }

  craFolder = craFolder || DEFAULT_craFolder;
  testsFolder = testsFolder || DEFAULT_testsFolder
  contractsFolder = contractsFolder || DEFAULT_contractsFolder
  console.log('Selected folder for react app:', craFolder);
  console.log('Selected testsFolder', testsFolder);
  console.log('contractFolder', contractsFolder);

  console.log("Creating config file: clevis.json")
  let init = fs.readFileSync(__dirname+"/../templates/config.json").toString()
  const config = Object.assign(JSON.parse(init), {
    ROOT_FOLDER: process.cwd(),
    CRA_FOLDER: craFolder,
    TESTS_FOLDER: testsFolder,
    CONTRACTS_FOLDER: contractsFolder,
    USE_INFURA: DEFAULT_useinfura,
    provider: DEFAULT_provider,
  });
  fs.writeFileSync("clevis.json", JSON.stringify(config,null,2));

  console.log("Writing docker scripts...")
  fs.writeFileSync("run.sh","#!/bin/bash\ndocker run -ti --rm --name clevis -p 3000:3000 -p 8545:8545 -v ${PWD}:/dapp austingriffith/clevis\n");
  fs.writeFileSync("attach.sh","#!/bin/bash\ndocker exec -ti clevis bash\n");
  fs.writeFileSync("stop.sh","#!/bin/bash\ndocker stop clevis\n");

  console.log("Creating contracts folder...")
  try{fs.mkdirSync(contractsFolder)}catch(e){}

  console.log("Syncing default tests...")
  if(!fs.existsSync(testsFolder)){
    copyRecursiveSync(__dirname+"/../templates/tests",testsFolder)
  }

  console.log("Touching contract list...")
  if(!fs.existsSync("contracts.clevis")){
    fs.writeFileSync("contracts.clevis","")
  }

  return "Done"
}

function cra(craFolder='./src') {
  return new Promise((resolve, reject) => {
    if(fs.existsSync(craFolder)){
      resolve("Skipping CRA, src exists...")
    } else {
      //TODO: CHANGE CLEVIS HERE TO MASTER ONCE WE MERGE IN
      console.log("Installing clevis (this will take a while to compile)...")
      let reactAction = exec(`npx create-react-app . && rm -rf src && npm install --save dapparatus && npm install --save-dev austintgriffith/clevis#0.1.0`, (err, stdout, stderr) => {
        if (err) {
          return reject(err);
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
    fs.createReadStream(src).pipe(fs.createWriteStream(dest));
  }
};
