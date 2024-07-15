FROM node:18-alpine3.14

ADD ./txt.tar.gz ./aaa

COPY ./txt.tar.gz ./bbb

# ADD 会自动解压缩，COPY不会