FROM node:24-alpine3.22 AS logicpack
WORKDIR /src

COPY --from=logic / /src
RUN npm install

RUN npm ci \
 && npm run build \
 && npm pack

FROM node:24-alpine3.22 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY --from=logicpack /src/*.tgz /tmp/logic.tgz

RUN npm install /tmp/logic.tgz && rm -f /tmp/logic.tgz

COPY . .

RUN npm run build

FROM node:24-alpine3.22

WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "start"]