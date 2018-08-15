#!/bin/bash
docker build -t clevis-dev -f DockerfileDev .
docker run -ti -v ${PWD}/../:/clevis clevis-dev bash -c "cd clevis && npm install"
