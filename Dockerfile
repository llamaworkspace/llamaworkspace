FROM node:20.12
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile --ignore-scripts --include=dev
COPY . ./
EXPOSE 5000