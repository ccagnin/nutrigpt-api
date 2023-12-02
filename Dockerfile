FROM node:18.10.0

WORKDIR /usr/nutrigpt-api

COPY . .

RUN npm install

EXPOSE 3333

CMD ["npm", "run", "start:prod", "npx", "prisma", "migrate", "deploy"]

