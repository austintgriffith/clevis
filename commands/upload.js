const { exec } = require('child_process')
const fs = require("fs")
const awsCreds = JSON.parse(fs.readFileSync("aws.json").toString().trim())
const s3 = require('s3');

module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> UPLOAD SITE")
  return await uploadSite(params)
}

function uploadSite(params) {
  const DEBUG = params.config.DEBUG;
  return new Promise((resolve, reject) => {
    if(!params.target){

    }else{
      uploadTo(resolve, reject, params, params.target)
    }
  })
}


function uploadTo(resolve, reject, params, site){
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" ]]] ]]] UPLOADING to "+site+"...")

  if(params.target.toLowerCase()=="ipfs"){
    exec('ipfs add -r build', (err, stdout, stderr) => {
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
  }else{
    var client = s3.createClient({
      s3Options: awsCreds,
    });
    String.prototype.replaceAll = function(search, replacement) {
        var target = this;
        return target.replace(new RegExp(search, 'g'), replacement);
    };
    let target = params.target.toLowerCase()
    if(target.indexOf(".")<0){
      target=target+".io"
    }
    var uploadparams = {
      localDir: "build",
      s3Params: {
        Bucket: target,
        Prefix: "",
        ACL: "public-read"
      },
    };
    let index = fs.readFileSync("build/index.html").toString();
    index = index.split("\"\/").join("\"");
    console.log(index);
    fs.writeFileSync("build/index.html",index);
    fs.readdir( uploadparams.localDir , function( err, files ) {
        if( err ) {
            console.error( "Could not list the directory.", err );
            process.exit( 1 );
        }
        var uploader = client.uploadDir(uploadparams);
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
}
