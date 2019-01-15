# Potentially read for merge. See checklist at bottom for some sanity checks
# TODO: Delete this file from the repo

## Structural
- Added commander.js to make the cli tool more extensible and maintainable
- Added winston.js for logging. Allows us to just add —debug option to any command and get debug output. Massively cleaned up all of the if(DEBUG) commands
- Added named params to each command. This allows us to easily see and test if params are not being used, or are being incorrectly referenced. For example if you type params.acounts, there is no way to know statically, however if your function paramater name is accounts, and you type it in the file as acounts, you will know.
- One theme I saw a lot was the use of many levels of redundant and needless promises/async functions nesting each other. For example block.js went from 13 lines to 3 just by unraveling these unneeded functions. This cleanup was done throughout the project. Transaction.js is another really good example.

<img width="461" alt="screen shot 2019-01-11 at 11 51 03 am" src="https://user-images.githubusercontent.com/616230/51056698-b9f06180-15a0-11e9-8592-f6c369ef1aa2.png">


## Command Specific

- all.js: I left this not ported, it looks like its in a state of getting built, so I’ll let you figure out when to add it
- balance.js: Added optional “units” argument to get balance in any form of units you want. Cleaned up weird rounding math going on and untangled the many nested promises/async functions.
- build.js: Changed from exec to spawn, cleaned up out stdout and stderr are piped
- create.js: DRY’ed up the template reading into a single function readTemplate(resource)
- help.js: Deleted this file, commander.js gives us the —help command
- init.js: Took out the installation of OpenZeppelin, clevis, s3, mocha and web3
- mocha.js: Deleted this file, we should not be globally installing mocha.
- new.js: Cleaned up the logic about whether or not to create the accounts. Throw errors if there are unrecoverable situations
- send.js: Added account index verifications. Previously if you put an index which was out of bounds, it would send money to account -x, burning your money. Now allows you to send data as well, and the sentTo functionality is encapsulated with the account abstraction which allows you to input either the address or the account index you want to use.
- sendTo.js: Deleted this file, it was a copy of send.js
- sendData.js: Deleted this file, added data as an optional arg to send.js
- sign.js: added accountIndex checking
- test.js: Got rid of the need for global mocha by using npx
- update.js: Big cleanup of some confusing logic related to rounding. Flatted out the nested async nature of things
- upgrade.js: Deleted this file, should not require clevis to be global, nor should we use this method rather than just using npm upgrade
- upload: Renamed target to site and made it required (it was implicitly in the code). Cant test this one because of aws stuff
- version: Cleaned up logic, we should probably not use this type of ‘version’ command. We should change it to support —version to just return the clevis version, and then if we need the web3 stuff too we can do something else

## Global

- Added utils.js to dry up the 4+ usages of “checkForReceipt” function.
- Got rid of the variable "gaspricegwei" from the project. It was misnamed, and was actually the gas price in **wei**. Note: The whole gas price thing with the rounding and mulitplying, then dividing by large numbers was a bit complicated, so I made a very verbose, very commented function in commands/update.js. The relevant section is here:

```
//This function is way more verbose than needed on purpose
//The logic is not easy to understand when done as a one-liner
//Returns the gas price in wei
function getGasPrice(toWei) {
  return axios.get("https://ethgasstation.info/json/ethgasAPI.json").then(response => {
    //ethgasstation returns 10x the actual average for some odd reason
    let actualAverage = response.data.average / 10
    winston.debug(`gas price actualAverage: ${actualAverage}`)

    //We want to just add a bit more than average to be speedy
    let safeAmount = actualAverage + 0.1
    winston.debug(`gas price safeAmount: ${safeAmount}`)

    //We want to round to the tenthousandth precision
    let rounded = Math.round(safeAmount * 10000) / 10000
    winston.debug(`gas price rounded: ${rounded}`)

    //Lets save the gas price in wei, rather than gwei, since that is how web3 expects it.
    let wei = toWei(`${rounded}`, 'gwei')
    winston.debug(`gas price wei: ${wei}`)

    return parseInt(wei)
  })
}
```

## TODOS

- Create a better “account” concept. We should be able to cleanly specify either index, or address to represent an account, and it should be consistent across all commands.
- Clean up the mega files like compile.js, deploy.js etc.
- Get winston logging objects with pretty print and colorize

## Important Notes

- Need to verify that the deleted commands, and modified APIs are not needed in other projects. sendData.js is one in particular to worry about
- Verify commands which use aws (upload, invalidate)

## TLDR Austin Checklist
- [ ] Bump to version 0.1.0
- [ ] Test out commands requiring aws creds (Update and invalidate)
- [ ] Update any documentation/blog posts/tutorials which reference Clevis to either specify  to use the old version, or with updated instructions with the new API.
- [ ] Make sure that any projects depending on the new version of Clevis work with the new system of not installing npm modules globally or downloading openzeppelin files and gitignoring them.
- [ ] Change any clevis commands in existing projects which use the sendTo or sendData commands. They are deleted and the functionality is all rolled into send.
