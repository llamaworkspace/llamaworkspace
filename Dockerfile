FROM node:18.19.1 AS base
WORKDIR /app
RUN apt-get update -y && apt-get install -y openssl
COPY package.json yarn.lock ./


FROM base AS dev
RUN yarn install --frozen-lockfile --ignore-scripts
COPY . ./
RUN npx prisma generate && yarn build
EXPOSE 3000
CMD ["yarn", "start"]