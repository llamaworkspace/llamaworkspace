FROM node:20.14
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install --frozen-lockfile --ignore-scripts
COPY . ./
EXPOSE 5000