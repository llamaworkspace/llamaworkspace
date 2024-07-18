FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json package-lock.json ./
RUN npm ci --frozen-lockfile --ignore-scripts && npm cache clean --force
COPY . .
RUN cp ./infra/.env.build .env \
  && echo "ENCRYPTION_KEY=$(npm run cloak:generate)" >> .env \
  && npm run postinstall \
  && npm run build
RUN chmod +x /app/entrypoint.sh
EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]