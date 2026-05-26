FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

# Install all dependencies (including devDependencies if needed for build steps)
RUN npm install

COPY . .

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/main.js ./

EXPOSE 8000

ENV PORT=8000

ENV NODE_ENV=production

# Run the app

CMD ["node", "main.js"]
