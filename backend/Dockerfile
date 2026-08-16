FROM node:24-alpine

WORKDIR /app

COPY ./package*.json ./

RUN npm ci

COPY ./ ./

RUN npm run build

EXPOSE 5050

CMD ["sh", "-c", "[ ! -f 'db/database.sqlite' ] && touch 'db/database.sqlite'; npm run start:prod"]