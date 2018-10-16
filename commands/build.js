const { exec } = require('child_process')
module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> BUILD SITE")
  return await buildSite(params)
}

function buildSite(params) {
  const DEBUG = params.config.DEBUG;
  return new Promise((resolve, reject) => {
    if(DEBUG) console.log(" ]]] ]]] BUILDING...")
    exec(`cd ${params.config.CRA_FOLDER};npm run build`, (err, stdout, stderr) => {
      if(DEBUG) console.log(err,stdout,stderr)
      if(err||stderr){
        console.log(err,stderr)
        reject(err)
      }else{
        resolve("DONE")
      }
    })
  })
}
