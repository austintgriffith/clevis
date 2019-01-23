FROM ubuntu:16.04

RUN echo "Break the cache for version 0.0.81"

RUN apt-get update
RUN apt-get dist-upgrade -y
RUN apt-get upgrade -y
RUN apt-get install build-essential python htop -y
RUN apt-get install git-core -y
RUN apt-get install curl -y
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install software-properties-common -y
RUN add-apt-repository -y ppa:ethereum/ethereum
RUN apt-get update && apt-get install ethereum -y

RUN apt-get install -y sudo && rm -rf /var/lib/apt/lists/*

RUN npm i npm@latest -g
RUN npm config set user 0
RUN npm config set unsafe-perm true
RUN npm install -g ganache-cli
RUN npm install -g npx

RUN echo "Break the cache for version 0.0.105 (do this after committing the package.json to github)"

RUN mkdir dapp
WORKDIR dapp

ADD bootstrap.sh /bootstrap.sh
RUN chmod +x /bootstrap.sh

CMD ../bootstrap.sh
