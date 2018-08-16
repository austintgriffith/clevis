#!/bin/bash
docker run \
  -p 3000:3000 \
  -v ~/clevis-dapp:/dapp \
  -ti clevis
