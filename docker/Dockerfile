FROM node:10

RUN apt-get update && apt-get install -y sudo && rm -rf /var/lib/apt/lists/*

RUN npm config set user 0
RUN npm config set unsafe-perm true

RUN npm install -g clevis

#RUN mkdir clevis

#RUN cd clevis && clevis init

CMD cd clevis && clevis init && npm start
