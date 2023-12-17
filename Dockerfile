FROM node:18.16
WORKDIR /app
COPY package.json yarn.lock prisma ./
RUN yarn install --frozen-lockfile --ignore-scripts
COPY . ./
EXPOSE 5000