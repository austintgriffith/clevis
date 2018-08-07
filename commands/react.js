const { exec } = require('child_process')
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

module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> CREATE REACT APP")
  return await cra(params)
}

function cra(params) {
  const DEBUG = params.config.DEBUG;
  return new Promise((resolve, reject) => {
    if(fs.existsSync("./src")){
      reject("ERROR: Can't install react because src dir already exists...")
    }else{
      let reactAction = exec('mkdir app;cd app;npx create-react-app .;npm i;cp -r * ..;cd ..;rm -rf app;rm -rf src;npm install --save dapparatus', (err, stdout, stderr) => {
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
