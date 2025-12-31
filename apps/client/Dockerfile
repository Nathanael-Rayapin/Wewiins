FROM node:20.19-alpine

WORKDIR /client

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 4200

CMD ["npm", "run", "start-development", "--", "--host", "0.0.0.0", "--poll", "2000"]