const spawn = require('child_process').spawn

module.exports = (testName, params) => {
  return new Promise((resolve, reject) => {
    let testFile = `${params.config.TESTS_FOLDER}/${testName}.js`
    let command = `npx mocha ${testFile} --bail`

    test = spawn(command, {stdio:'inherit', shell: true});

    test.on('exit', function (code) {
        resolve(code)
    });
  })
}
