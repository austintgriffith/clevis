FROM ubuntu:16.04

RUN echo "Break the cache for version 0.0.81"

RUN apt-get update
RUN apt-get dist-upgrade -y
RUN apt-get upgrade -y
RUN apt-get install build-essential python htop -y
RUN apt-get install curl -y
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt-get install -y nodejs
RUN apt-get install software-properties-common -y
RUN add-apt-repository -y ppa:ethereum/ethereum
RUN apt-get update && apt-get install ethereum -y

RUN apt-get update && apt-get install -y sudo && rm -rf /var/lib/apt/lists/*

RUN apt-get update
RUN npm i npm@latest -g
RUN npm config set user 0
RUN npm config set unsafe-perm true
RUN npm install -g ganache-cli
RUN npm install -g npx
RUN apt-get install git-core -y

RUN echo "Break the cache for version 0.0.91 (do this after committing the package.json to github)"

RUN git clone https://github.com/austintgriffith/clevis.git
RUN cd clevis && npm install && npm link

RUN mkdir dapp
WORKDIR dapp

ADD bootstrap.sh /bootstrap.sh
RUN chmod +x /bootstrap.sh

CMD ../bootstrap.sh
