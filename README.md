# clevis

Ethereum blockchain orchestration, testing, and command line interface.

### install
```
npm install -g clevis
```

### install from source
```
git clone https://github.com/austintgriffith/clevis.git
cd clevis
npm install
sudo npm link
```


### in docker
```
npm config set user 0
npm config set unsafe-perm true
```

```
npm install -g clevis
```

## commands/examples

### help
lists available commands and usage

### init
installs/updates latest version and initializes configuration

### update
loads latest prices and standard gas and updates config

### accounts
lists accounts

### unlock [accountindex]
unlocks account

### send [amount] [fromindex] [toindex]
send ether from one local account to another by index

### sendTo [amount] [fromindex] [toaddress]
send ether from local account to any address

### balance [address]
get balance of any Ethereum address

### sign [string] [accountindex] [password]
sign a string with a local account

### recover [string] [signature]
recover address used to sign a string

### sendData [amount] [fromindex] [toaddress] [data]
send ether and/or data to an account

### create [contractname]
create a contract

### compile [contractname]
compile a contract

### deploy [contractname] [accountindex]
deploy a contract

### contract [scriptname] [contractname]
interact with a contract
these scripts are generated automatically using the ABI
(list .clevis folder inside any contract folder to see all scripts)

example:
```
clevis contract balanceOf Copper 0x2a906694d15df38f59e76ed3a5735f8aabcce9cb
```

### test [testname]
run mocha test from tests folder

### wei [amount] [symbol]
convert to and from wei and ether

example:
```
clevis wei 1 ether
```

### hex [asciistring]
convert a string to hex

### ascii [hexstring]
convert hex to a string

### block [blocknumber]
get block information

### blockNumber
get current block number

### transaction [hash]
get transaction information

## demo

[![cleviscast](http://s3.amazonaws.com/atgpub/clevispreview2.png)](http://s3.amazonaws.com/atgpub/clevis.mp4)
