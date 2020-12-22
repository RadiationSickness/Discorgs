FROM node:15.4.0-alpine

WORKDIR /user/src/app

COPY package*.json ./
COPY tsconfig*.json ./
COPY ./src ./src

RUN npm install

ADD . /usr/src/app

RUN npm run build

CMD [ "node", "dist/src/index.js" ]
EXPOSE 3000