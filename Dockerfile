FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json package-lock.json ./
RUN npm ci --frozen-lockfile --ignore-scripts && npm cache clean --force
COPY . .

  # Override .env.example with .env.build
RUN cat .env.example ./infra/.env.demo > .env \
  # Generate a one-off encryption key to avoid having one hard-coded
  # and risk someone to re-use it
  && ENCRYPTION_KEY=$(npm run cloak:generate | tail -n 1) \
  && printf "\nENCRYPTION_KEY=$ENCRYPTION_KEY" >> .env \
  # Run build
  && npm run postinstall \
  && npm run build \
  && rm .env

EXPOSE 3000
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]