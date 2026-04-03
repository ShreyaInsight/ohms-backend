FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src
COPY .env.example ./.env.example

ENV NODE_ENV=production
ENV PORT=4000
ENV DATABASE_URL=postgresql://postgres:postgres@postgres:5432/medcore_hms
ENV FRONTEND_ORIGIN=http://localhost:4000

EXPOSE 4000

CMD ["sh", "-c", "node src/db/initDb.js && node src/server.js"]
