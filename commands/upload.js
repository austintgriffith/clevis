const { exec } = require('child_process')
const fs = require("fs")
const awsCreds = JSON.parse(fs.readFileSync("aws.json").toString().trim())
const s3 = require('s3');
const winston = require('winston')

//NOTE: Austin, I'm almost 100% sure this isn't needed. Can you verify and delete
String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

module.exports = async (site, params) => {
  winston.debug(" ]]] ]]] UPLOADING to "+site+"...")

  if(site.toLowerCase()=="ipfs"){
    return uploadToIpfs()
  } else {
    return uploadToS3(site)
  }
}

function uploadToS3(site) {
  //Setup
  var client = s3.createClient({
    s3Options: awsCreds,
  });
  uploadParams = buildS3Params(site)

  //Prep index
  let index = fs.readFileSync("build/index.html").toString();
  index = index.split("\"\/").join("\"");
  winston.debug(index);
  fs.writeFileSync("build/index.html",index);

  //Upload
  fs.readdir( uploadParams.localDir , function( err, files ) {
    if( err ) {
      console.error( "Could not list the directory.", err );
      process.exit( 1 );
    }

    var uploader = client.uploadDir(uploadParams);
    uploader.on('error', function(err) {
      console.error("unable to sync:", err.stack);
    });
    uploader.on('progress', function() {
      console.log("progress", uploader.progressAmount, uploader.progressTotal);
    });
    uploader.on('end', function() {
      console.log("done uploading "+target);
    });
  })
}

function buildS3Params(site) {
  let target = site.toLowerCase()

  if(target.indexOf(".") <0){
    target = target + ".io"
  }

  var uploadParams = {
    localDir: "build",
    s3Params: {
      Bucket: target,
      Prefix: "",
      ACL: "public-read"
    }
  }

  return uploadParams
}

function uploadToIpfs() {
  return exec('ipfs add -r build', (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return;
    }
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    console.log("Done. Visit ipfs location https://ipfs.io/ipfs/YOURHASH to get it cached.")
    console.log("You might also want to run 'node invalidate.js' to clear the cloudfront cache.")
  })
}
