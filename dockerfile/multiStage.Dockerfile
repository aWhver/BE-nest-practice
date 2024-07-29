# 多阶段构建,只包含输出目录和运行时的依赖，减小体积
FROM node:18-alpine3.14 as build-stage

WORKDIR /app

COPY package.json .

COPY *.lock .

RUN npm config set registry https://registry.npmmirror.com

RUN  npm install

COPY . .

RUN npm run build

FROM node:18-alpine3.14 as production-stage

COPY  --from=build-stage /app/dist /app
COPY  --from=build-stage /app/package.json /app/package.json

WORKDIR /app

RUN  npm config set registry https://registry.npmmirror.com

RUN  npm install --production

EXPOSE 3100

CMD [ "node", "/app/main.js" ]
