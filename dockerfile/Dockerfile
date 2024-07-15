# 使用 alpine作为基础镜像可以减少很大的体积
FROM node:18-alpine3.14

WORKDIR /app

COPY package.json .

COPY *.lock .

RUN npm config set registry https://registry.npmmirror.com

RUN  npm install

COPY . .

RUN npm run build

EXPOSE 3100

CMD [ "node", "./dist/main.js" ]