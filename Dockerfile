FROM node:15.4.0-alpine as base

WORKDIR /app

COPY ["package*.json", "tsconfig*.json", "./"]
COPY ./src ./src

RUN npm install

ADD . /app

RUN npm run build

CMD [ "node", "dist/src/index.js" ]
EXPOSE 3000