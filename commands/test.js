module.exports = async (params)=>{
  return await runTest(params);
}
function runTest(params){
  const DEBUG = params.config.DEBUG;
  return new Promise((resolve, reject) => {
    var spawn = require('child_process').spawn,
    test = spawn('mocha', [params.config.TESTS_FOLDER + "/" + params.testname+".js", "--bail"], {stdio:'inherit'});
    test.on('exit', function (code) {
        resolve(code)
    });
  })
}
