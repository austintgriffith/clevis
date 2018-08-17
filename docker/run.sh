#!/bin/bash
## ---- No Network means use local ganache-cli
docker run \
  -p 3000:3000 \
  -p 8545:8545 \
  -v ~/your-dapp:/dapp \
  -ti clevis

## ---- RINKEBY RPC ----  ----  ----  ----  ----  ----  ----  ----
#docker run \
#  --env network=rinkeby \
#  -p 3000:3000 \
#  -p 8545:8545 \
#  -v ~/your-dapp:/dapp \
#  -ti clevis
## ---- EXTERNAL RPC ----  ----  ----  ----  ----  ----  ----  ----

## ---- EXTERNAL RPC ----  ----  ----  ----  ----  ----  ----  ----
#docker run \
#  --env network="http://10.0.0.107:8545" \
#  -p 3000:3000 \
#  -v ~/your-dapp:/dapp \
#  -ti clevis
#  ----  ----  ----  ----  ----  ----  ----  ----  ----  ----  ----


#docker run -p 3000:3000 -p 8545:8545 -v ~/your-dapp:/dapp -ti clevis
