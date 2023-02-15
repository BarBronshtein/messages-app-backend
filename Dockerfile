FROM node:latest

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
RUN npm install

COPY . /app

EXPOSE 7050

ENV NODE_ENV="development"
ENV DB_NAME="chat_db"

ENTRYPOINT ["node"]
CMD ["node","dist/server.js"]