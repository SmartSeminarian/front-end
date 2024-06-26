FROM node:18

WORKDIR /app

COPY ./smart-seminarian-frontend /app/

RUN npm install

EXPOSE 5000

ENTRYPOINT /app/entrypoint.sh
