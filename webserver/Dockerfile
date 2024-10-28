FROM node:slim

WORKDIR /usr/src/webserver
COPY package.json package.json
COPY yarn.lock yarn.lock
COPY .yarnrc.yml .yarnrc.yml
RUN yarn install
WORKDIR /usr/src/webserver/ui
COPY package.json package.json
COPY yarn.lock yarn.lock
COPY .yarnrc.yml .yarnrc.yml
RUN NODE_ENV=development yarn install --verbose
WORKDIR /usr/src/webserver
COPY . .
