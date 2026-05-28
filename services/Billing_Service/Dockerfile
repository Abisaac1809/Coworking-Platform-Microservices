FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/main.js ./
COPY --from=builder /app/db ./db
COPY --from=builder /app/routes ./routes
COPY --from=builder /app/controllers ./controllers
COPY --from=builder /app/services ./services
COPY --from=builder /app/repositories ./repositories
COPY --from=builder /app/middlewares ./middlewares
COPY --from=builder /app/utils ./utils
COPY --from=builder /app/validators ./validators

EXPOSE 8000

ENV PORT=8000
ENV NODE_ENV=production

CMD ["node", "main.js"]