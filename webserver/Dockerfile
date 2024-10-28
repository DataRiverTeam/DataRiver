FROM node:slim
WORKDIR /usr/src/webserver
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
WORKDIR /usr/src/webserver/ui
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm install
WORKDIR /usr/src/webserver
COPY . .
