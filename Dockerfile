FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY .env.example ./.env.example

ENV NODE_ENV=production
ENV PORT=4000
ENV DB_PATH=./data/hms.sqlite
ENV FRONTEND_ORIGIN=http://localhost:4000
ENV NODE_OPTIONS=--experimental-sqlite

EXPOSE 4000

CMD ["sh", "-c", "node src/db/initDb.js && node src/server.js"]
