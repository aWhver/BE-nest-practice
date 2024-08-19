FROM node:18.0-alpine3.14 as build-stage

WORKDIR /app

COPY package.json .

RUN npm config set registry https://registry.npmmirror.com

RUN npm install

COPY . .

RUN npm run build

FROM nginx:stable as production-stage

WORKDIR /app

COPY --from=build-stage /app/build /usr/share/nginx/html/meeting_room_booking_system

COPY --from=build-stage /app/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD [ "nginx", "-g", "daemon off;" ]
