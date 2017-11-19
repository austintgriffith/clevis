#! /usr/bin/env node
let clevis = require("./index.js");
let args = process.argv;
args.splice(0,2)
clevis(...args)
