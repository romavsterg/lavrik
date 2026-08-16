FROM node:24-alpine AS frontend-builder

WORKDIR /app

COPY frontend/package*.json ./

RUN npm ci

COPY frontend/ ./

RUN npm run build

FROM node:24-alpine AS admin-builder

WORKDIR /app

COPY admin/package*.json ./

RUN npm ci

COPY admin/ ./

RUN npm run build

FROM nginx:alpine

COPY --from=frontend-builder /app/dist /usr/share/nginx/html

COPY --from=admin-builder /app/dist /usr/share/nginx/html/admin

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
