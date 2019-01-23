#!/bin/bash
if [ -z "$network" ]; then
  network="local"
fi

echo 'export PS1="\[\e]0;\u@\h: \w\a\]${debian_chroot:+($debian_chroot)}🗜️ \e[0;34mClevis\e[m:\e[0;32m\w\e[m 🗜️ "' >> ~/.bashrc

echo "Launching 🗜️ Clevis with network [ $network ]..."

if [ ! -f /dapp/clevis.json ]; then
  echo "Initializing Clevis..."
  npx clevis init
fi
echo "NPM installing..."
npm i

if [ "$network" = "local" ]; then
  echo "Launching ganache-cli..."
  ganache-cli -h 0.0.0.0 > geth.log 2>&1 &
elif [ "$network" = "rinkeby" ]; then
  echo "Launching Rinkeby Geth..."
  /usr/bin/geth --rinkeby --syncmode "light" --cache 512 --maxpeers 25 --datadir ".geth-rinkeby" --rpc --rpcaddr 0.0.0.0 --rpcapi="db,eth,net,web3,personal" > geth.log 2>&1 &
elif [ "$network" = "ropsten" ]; then
  echo "Launching Ropsten Geth..."
  /usr/bin/geth --testnet --syncmode "light" --cache 512 --maxpeers 25 --datadir ".geth-ropsten" --rpc --rpcaddr 0.0.0.0 --rpcapi="db,eth,net,web3,personal" > geth.log 2>&1 &
elif [ "$network" = "mainnet" ]; then
  echo "Launching Mainnet Geth..."
  /usr/bin/geth --syncmode "light" --cache 512 --maxpeers 25 --datadir ".geth" --rpc --rpcaddr 0.0.0.0 --rpcapi="db,eth,net,web3,personal" > geth.log 2>&1 &
else
  echo "Using external RPC network: $network"
  sed -i "s|http:\/\/localhost:8545|$network|g" clevis.json
fi

./node_modules/clevis/bin.js start > react.log 2>&1 &

./node_modules/clevis/bin.js --help

./node_modules/clevis/bin.js version

bash
