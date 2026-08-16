FROM node:24-alpine

WORKDIR /app

COPY ./package*.json ./

RUN npm ci

COPY ./ ./

RUN npm run build

EXPOSE 5050

CMD ["sh", "-c", "[ -f /app/database.sqlite ] || touch /app/database.sqlite && npm run start:prod"]
