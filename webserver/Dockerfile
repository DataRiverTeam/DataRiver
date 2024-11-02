FROM node:slim

WORKDIR /usr/src/webserver
COPY . .
RUN yarn install
WORKDIR /usr/src/webserver/ui
RUN yarn install
WORKDIR /usr/src/webserver
