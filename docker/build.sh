#!/bin/bash
rm -rf ../node_modules
docker build --no-cache -t clevis .
