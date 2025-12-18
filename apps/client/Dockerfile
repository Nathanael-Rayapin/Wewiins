FROM node:20.19-alpine

WORKDIR /client

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 4200

CMD ["npm", "start", "--", "--host", "0.0.0.0"]