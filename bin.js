#! /usr/bin/env node
(async () => {
  let clevis = require("./index.js")
  let args = process.argv
  args.splice(0,2)
  console.log(await clevis(...args))
})()
