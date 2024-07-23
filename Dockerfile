FROM node:18

WORKDIR /app

COPY ./app/ /app/

RUN apt-get update && apt-get install -y curl

RUN cd /app && npm install

EXPOSE 5000

ENTRYPOINT /app/entrypoint.sh
