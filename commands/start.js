const { exec } = require('child_process')
module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> START SITE")
  return await buildSite(params)
}

function buildSite(params) {
  const DEBUG = params.config.DEBUG;
  return new Promise((resolve, reject) => {
    if(DEBUG) console.log(" ]]] ]]] STARTING REACT DEV SERVER...")
    exec('npm start', (err, stdout, stderr) => {
      if(DEBUG) console.log(err,stdout,stderr)
      if(err||stderr){
        console.log(err,stderr)
        reject(err)
      }else{
        resolve("DONE")
      }
    }).stdout.pipe(process.stdout);
  })
}
