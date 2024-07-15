FROM node:18-alpine3.14

WORKDIR /app

COPY package.json .

COPY *.lock .

RUN npm config set registry https://registry.npmmirror.com

RUN  npm install

COPY . .

RUN npm run build

EXPOSE 3100

# CMD [ "node", "./dist/main.js" ]

ENTRYPOINT [ "node", "./dist/main.js" ]

# CMD 和 ENTRYPOINT 区别
# CMD 可以在执行命令时被覆盖
#     ex: docker run cdm-test echo "我要覆盖 dockerfile里的 CMD命令"

# ENTRYPOINT 不会被覆盖，后面的命令会追加进来，一起执行

# ENTRYPOINT 和 CMD 一起使用通常可以用 ENTRYPOINT 用作默认指令
#     ex: ENTRYPOINT ["echo", "这个是默认的指令"]
#         CMD ["这个可以被覆盖"]