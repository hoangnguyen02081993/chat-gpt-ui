FROM nginx:latest

WORKDIR /app

COPY ./src/ .

COPY ./default.conf /etc/nginx/nginx.conf