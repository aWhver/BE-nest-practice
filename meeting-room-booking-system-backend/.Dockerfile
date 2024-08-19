FROM node:18.0-alpine3.14 as build-stage

WORKDIR /app

COPY package.json .

RUN npm config set registry https://registry.npmmirror.com

RUN npm install

COPY . .

RUN npm run build

FROM node:18.0-alpine3.14 as product-stage

COPY --from=build-stage /app/dist /app
COPY --from=build-stage /app/package.json /app/package.json

WORKDIR /app

RUN npm config set registry https://registry.npmmirror.com

RUN npm install --production

ENV STAGE=prod

EXPOSE 3105

CMD [ "node", "/app/main.js"]
