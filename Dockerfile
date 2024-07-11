FROM node:18

WORKDIR /app

COPY ./ /app/

RUN apt-get update && apt-get install -y curl

RUN cd smart-seminarian-frontend && npm install

EXPOSE 5000

ENTRYPOINT /app/smart-seminarian-frontend/entrypoint.sh
