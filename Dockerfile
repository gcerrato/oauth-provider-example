FROM node:alpine

RUN apk add --no-cache make gcc g++ python
RUN npm install npm@latest -g -s

WORKDIR /usr/src/oauth-provider-example
COPY . /usr/src/oauth-provider-example
RUN npm ci

CMD ["npm", "start"]
EXPOSE 8000
