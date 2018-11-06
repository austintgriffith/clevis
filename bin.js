#! /usr/bin/env node
(async () => {
  let clevis = require("./index.js")
  let args = process.argv
  args.splice(0,2)
  console.log(await clevis(...args))
  process.exit(0) ///when using socket web3 it hangs open, let's force it close when we are done
})()
