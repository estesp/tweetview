FROM node:6.8

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install

EXPOSE 8080
ENV REDIS_HOST localhost
ENV REDIS_PORT 6379

COPY . /usr/src/app

CMD ["node", "app.js"]
