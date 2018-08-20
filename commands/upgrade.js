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
    //fs.copySync(src, dest);
    fs.createReadStream(src).pipe(fs.createWriteStream(dest));
  }
};

module.exports = async (params)=>{

  console.log("Upgrading clevis (this will take a while to compile)...")

  exec('rm -rf node_modules/clevis;', (err, stdout, stderr) => {
    exec('clevis init', (err, stdout, stderr) => {}).stdout.on('data', function(data) {
        console.log(data);
    })
  }).stdout.on('data', function(data) {
    console.log(data);
  })

  return "Clevis Upgrading..."
}
