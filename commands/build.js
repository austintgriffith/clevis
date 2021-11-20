const { spawn } = require('child_process')

module.exports = async (params) => {
  return await new Promise((resolve, reject) => {
    let build = spawn(`cd ${params.config.CRA_FOLDER} && npm run build`, {shell: true})

    build.stdout.on('data', data => console.log(data.toString()))
    build.stderr.on('data', data => console.log(data.toString()))
    build.on('error', (err) => reject(err))
    build.on('exit', (code) => resolve(code))
  })
}
