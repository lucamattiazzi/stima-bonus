FROM node:14-alpine

RUN mkdir /app
WORKDIR /app
RUN npm install -g yarn
COPY ./package.json /app/.
COPY ./src /app/.
RUN yarn install
EXPOSE 4000

CMD ["node", "/app/src/index.js"]