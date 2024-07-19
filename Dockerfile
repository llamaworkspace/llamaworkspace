FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --frozen-lockfile --ignore-scripts && npm cache clean --force

COPY . ./

RUN cp .env.example .env
RUN ENCRYPTION_KEY=$(npm run cloak:generate | tail -n 1) \
  && printf "\nENCRYPTION_KEY=$ENCRYPTION_KEY" >> .env
RUN  npm run postinstall \
  && npm run build \
  && rm .env

EXPOSE 5000
RUN chmod +x /app/entrypoint.sh
ENTRYPOINT ["/app/entrypoint.sh"]