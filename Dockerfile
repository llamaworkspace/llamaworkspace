FROM node:20.12
WORKDIR /app

COPY package.json package-lock.json ./

COPY apps/llamaws/package.json apps/llamaws/package-lock.json ./apps/llamaws/

COPY packages/eslint-config/package.json ./packages/eslint-config/
COPY packages/typescript-config/package.json ./packages/typescript-config/

RUN npm install --frozen-lockfile --ignore-scripts
COPY . ./
EXPOSE 5000