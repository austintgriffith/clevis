const { exec } = require('child_process')
const fs = require("fs")
const AWS = require('aws-sdk')
const awsCreds = JSON.parse(fs.readFileSync("aws.json").toString().trim())
const winston = require('winston')

module.exports = async (target, params) => {
  return await new Promise((resolve, reject) => {
    winston.debug(` ]]] ]]] INVALIDATING ${target}...`)
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
