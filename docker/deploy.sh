#!/bin/bash
docker tag clevis austingriffith/clevis:$1
docker tag clevis austingriffith/clevis:latest
docker push austingriffith/clevis
