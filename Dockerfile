FROM node:18.19.1
WORKDIR /app
COPY package.json yarn.lock prisma ./
RUN yarn install --frozen-lockfile --ignore-scripts
COPY . ./
EXPOSE 5000