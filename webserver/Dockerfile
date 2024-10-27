FROM node:slim
WORKDIR /usr/src/webserver
COPY . .
RUN npm install
WORKDIR /usr/src/webserver/ui
RUN npm install
WORKDIR /usr/src/webserver
