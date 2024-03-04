FROM node:18.10.0

WORKDIR /usr/nutrigpt-api

COPY . .

RUN npm install -g @nestjs/cli
RUN npm install

EXPOSE 3333

CMD ["nest" "start"]
