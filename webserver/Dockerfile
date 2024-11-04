FROM node:slim

WORKDIR /usr/src/webserver
COPY .yarnrc.yml .yarnrc.yml 
COPY package.json package.json 
COPY yarn.lock yarn.lock 
RUN yarn install
COPY . .

WORKDIR /usr/src/webserver/ui
RUN yarn install
WORKDIR /usr/src/webserver
