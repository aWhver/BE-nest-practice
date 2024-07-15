# 添加构建参数，配置会更加灵活
FROM node:18-alpine3.14

ARG FN

ARG LN

WORKDIR /app

COPY ./src/ARG.test.js .

ENV FN=${FN}\
    LN=${LN}

CMD [ "node", "/app/ARG.test.js" ]