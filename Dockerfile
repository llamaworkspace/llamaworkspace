FROM node:20.12
WORKDIR /app
COPY package.json package-lock.json ./
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . ./
EXPOSE 5000