FROM node:slim

WORKDIR /usr/src/webserver
COPY .yarnrc.yml .yarnrc.yml
COPY package.json package.json
COPY yarn.lock yarn.lock
RUN yarn install
WORKDIR /usr/src/webserver/ui
COPY ui/.yarnrc.yml .yarnrc.yml
COPY ui/package.json package.json
COPY ui/yarn.lock yarn.lock
RUN yarn install
WORKDIR /usr/src/webserver
