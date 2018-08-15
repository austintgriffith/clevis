#!/bin/bash
docker run -ti -p 3000:3000 -v ${PWD}/dapp:/clevis clevis bash
