# 🗜️clevis

Ethereum blockchain orchestration, testing, CLI, and Dapp scaffolding.

## install

easiest: use docker (it handles the environment and RPC node for you):
```
docker run -ti --rm --name clevis -p 3000:3000 -p 8545:8545 \
  -v ~/your-dapp-directory:/dapp austingriffith/clevis:latest
```

OR install/link for the source:
```
git clone https://github.com/austintgriffith/clevis.git
cd clevis
npm install
sudo npm link
```

OR try an npm install:
```
sudo npm install --unsafe-perm -g clevis@latest
```

If you aren't using docker make sure you install ganache-cli and mocha:
```
npm install -g ganache-cli
npm install -g mocha
```

[Read full article and watch screencast here!](https://medium.com/@austin_48503/%EF%B8%8Fclevis-blockchain-orchestration-682d2396aeef)


## demo

[![Clevis Demo Video](https://user-images.githubusercontent.com/2653167/44128017-a7caa1d2-9ffd-11e8-999c-ceabc3287647.png)](https://www.youtube.com/watch?v=lekFaRzma8U)


## docker options

### attach to already running clevis container
```
docker exec -ti clevis bash
```


### external RPC
```
docker run -ti --rm --name clevis --env network="http://10.0.0.107:8545" \
  -p 3000:3000 -p 8545:8545 -v ~/your-dapp-directory:/dapp austingriffith/clevis
```

### Automatic Rinkeby Geth Node
```
docker run -ti --rm --name clevis --env network="rinkeby" \
  -p 3000:3000 -p 8545:8545 -v ~/your-dapp-directory:/dapp austingriffith/clevis
```

### Automatic Ropsten Geth Node
```
docker run -ti --rm --name clevis --env network="ropsten" \
  -p 3000:3000 -p 8545:8545 -v ~/your-dapp-directory:/dapp austingriffith/clevis
```

### Automatic Mainnet Geth Node
```
docker run -ti --rm --name clevis --env network="mainnet." \
  -p 3000:3000 -p 8545:8545 -v ~/your-dapp-directory:/dapp austingriffith/clevis
```

### Docker build from Clevis Repo
```
git clone https://github.com/austintgriffith/clevis.git
cd clevis
docker build ./docker -t clevis
docker run -ti --rm --name clevis -p 3000:3000 -p 8545:8545 -v ~/your-dapp-directory:/dapp clevis
```

### Using Infura

If you want to use Infura to deploy, you need to make the following changes:

In your `clevis.json` config file, change:

```
USE_INFURA: true
```

Create a `.env file` and add your private key under mnemonic:

```
mnemonic=32h42hj34mysuperprivakeyasdasd2h34hjk234
```

## troubleshooting

Right now the web3 dependencies are not very well supported and installs can fail on certain machines.

I would recommend using Docker and the container model because it handles the environment and geth node for you.

*WARNING* if you get this error: gyp ERR! stack Error: EACCES: permission denied, mkdir '/usr/local/lib/node_modules/clevis/node_modules/scrypt/build'
```
rm -rf .node-gyp
sudo npm install --unsafe-perm -g clevis@latest
```


-----

Sometimes you might get a "Cannot find module 'web3' error"

```
clevis test version
(node:32368) UnhandledPromiseRejectionWarning: Error: Cannot find module 'web3'
    at Function.Module._resolveFilename (internal/modules/cjs/loader.js:581:15)
    at Function.Module._load (internal/modules/cjs/loader.js:507:25)
    at Module.require (internal/modules/cjs/loader.js:637:17)
    at require (internal/modules/cjs/helpers.js:20:18)
    ...
(node:32368) UnhandledPromiseRejectionWarning: Unhandled promise rejection. This error originated either by throwing inside of an async function without a catch block, or by rejecting a promise which was not handled with .catch(). (rejection id: 1)
(node:32368) [DEP0018] DeprecationWarning: Unhandled promise rejections are deprecated. In the future, promise rejections that are not handled will terminate the Node.js process with a non-zero exit code.
```

The fix for this is to go to wherever you have clevis cloned and run an npm link again:
(and maybe an npm i)

```
cd ~/clevis
npm link 
```

---------

Another error I run into from time to time due to Create React App with 'npm run build':

```
.../node_modules/mini-css-extract-plugin/dist/index.js:20
  util: { createHash }
          ^

TypeError: Cannot destructure property `createHash` of 'undefined' or 'null'.
```
To fix it you just need to install webpack locally in your project with:
```
npm install --save webpack
```

-------------

Another error I've hit is this one:
```
There might be a problem with the project dependency tree.
It is likely not a bug in Create React App, but something you need to fix locally.

The react-scripts package provided by Create React App requires a dependency:

  "babel-eslint": "9.0.0"

Don't try to install it manually: your package manager does it automatically.
However, a different version of babel-eslint was detected higher up in the tree:
```

to fix this, add a .env file with "SKIP_PREFLIGHT_CHECK=true" in it: 
```
echo "SKIP_PREFLIGHT_CHECK=true" >> .env
```




If you have other errors or problems, let's get this list populated. Shoot me an email and let's debug: austin@concurrence.io



## commands/examples

### help
```
clevis help
```
lists available commands and usage

### init
```
clevis init
```
installs/updates latest version, creates the react app, and initializes configuration

### version
```
clevis version
```
lists current version

### update
```
clevis update
```
loads latest prices and standard gas and updates config

### accounts
```
clevis accounts
```
lists accounts from Geth or other RPC endpoint

### new [password]
```
clevis new ""
```
creates a new address

### unlock [accountindex] ["password"]
```
clevis unlock 0 ""
```
unlocks account

### send [amount] [fromindex] [toindex]
```
clevis send 0.1 0 1
```
send ether from one local account to another by index

### sendTo [amount] [fromindex] [toaddress]
```
clevis sendTo 0.1 0 0x6FC8152A3C0E0aC8e61faf233915e1334b58fC77
```
send ether from local account to any address

### balance [address]
```
clevis balance 0x6FC8152A3C0E0aC8e61faf233915e1334b58fC77
```
get balance of any Ethereum address or local index

### sign [string] [accountindex] [password]
```
clevis sign "Hello World" 0 ""
```
sign a string with a local account

### recover [string] [signature]
```
clevis recover "Hello World" "0x87dc7..."
```
recover address used to sign a string

### sha3 [string]
```
clevis sha3 "Hello World"
```
generates the keccak256 hash of a string

### sendData [amount] [fromindex] [toaddress] [data]
```
clevis sendData 0.001 0 0x6FC8152A3C0E0aC8e61faf233915e1334b58fC77 "0x01"
```
send ether and/or data to an account

### create [contractname]
```
clevis create SomeContract
```
create a contract

### compile [contractname]
```
clevis compile SomeContract
```
compile a contract

### deploy [contractname] [accountindex]
```
clevis deploy SomeContract 0
```
deploy a contract

### explain [contractname]
```
clevis explain SomeContract
```
list all contract commands/events etc

### contract [scriptname] [contractname] [[accountIndex]] [[contractArguments...]]
```
clevis contract someFunction SomeContract 1 someArgument
```
interact with a contract
these scripts are generated automatically using the ABI
(list .clevis folder inside any contract folder to see all scripts)

you can also read from contracts:
```
clevis contract balanceOf Copper 0x2a906694d15df38f59e76ed3a5735f8aabcce9cb
```

### contract event[eventname] [contractname]
```
clevis contract eventMyEvent SomeContract
```

Shows all the logs emitted under eventname.

Please note that there is not blank between event and your event name.


### test [testname]
```
clevis test compile
```
run mocha test from tests folder

### fromwei [amount] [symbol]
```
clevis wei 100000000000 ether
```
convert from wei to ether or others like gwei or szabo

### towei [amount] [symbol]
```
clevis wei 0.001 ether
```
convert to wei from ether or others like gwei or szabo

### hex [asciistring]
```
clevis hex "Hello World"
```
convert a string to hex

### ascii [hexstring]
```
clevis ascii "0x48656c6c6f20576f726c64"
```
convert hex to a string

### blockNumber
```
clevis blockNumber
```
get current block number

### block [blocknumber]
```
clevis block 2618069
```
get block information

### transaction [hash]
```
clevis transaction 0x474acab2ba2702a90c4b774d7cee7fe1364ca1df01735ecef188522f8ce40bc4
```
get transaction information

### build
```
clevis build
```
builds static react site

### upload [target]
```
clevis upload metatx.io
```
uploads static react site to s3 bucket named after url

### invalidate [target]
```
clevis invalidate E3837d00567
```
invalidate cloudfront caching to show fresh content

## demo

[![cleviscast](http://s3.amazonaws.com/atgpub/clevispreview2.png)](http://s3.amazonaws.com/atgpub/clevis.mp4)
