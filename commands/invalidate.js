const { exec } = require('child_process')
const fs = require("fs")
const awsCreds = JSON.parse(fs.readFileSync("aws.json").toString().trim())
const AWS = require('aws-sdk')

module.exports = async (params)=>{
  const DEBUG = params.config.DEBUG;
  if(DEBUG) console.log(" >>> INVALIDATE")
  return await invalidateSite(params)
}

function invalidateSite(params) {
  const DEBUG = params.config.DEBUG;
  return new Promise((resolve, reject) => {
    if(DEBUG) console.log(" ]]] ]]] INVALIDATING "+params.target+"...")
    var cloudfront = new AWS.CloudFront(new AWS.Config(awsCreds));
    var cfparams = {
      DistributionId: params.target,
      InvalidationBatch: {
        CallerReference: ''+(new Date()),
        Paths: {
          Quantity: 1,
          Items: ["/*"]
        }
      }
    };
    cloudfront.createInvalidation(cfparams, function(err, data) {
      if (err) reject(err, err.stack); // an error occurred
      else     resolve(data);           // successful response
    });
  })
}
