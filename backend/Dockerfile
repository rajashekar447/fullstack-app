
FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --omit=dev --no-audit --no-fund

COPY server.js ./

EXPOSE 3000

CMD ["node", "server.js"]
