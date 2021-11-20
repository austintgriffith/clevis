const clevis = require("./clevis.js")
for(let c in clevis.contracts){
  clevis.compile(clevis.contracts[c])
}
/*
    if you want to add proxy functions from another contract you can do:
    clevis.compile(clevis.contracts[c],"SomeProxyContractName")
 */
