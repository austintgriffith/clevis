#!/bin/bash
docker run \
  -p 3000:3000 \
  -p 8545:8545 \
  -v ~/clevis-dapp:/dapp \
  -ti clevis
