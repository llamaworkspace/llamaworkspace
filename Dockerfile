FROM node:18.19
WORKDIR /app
COPY package.json package-lock.json prisma ./
RUN npm install --frozen-lockfile --ignore-scripts
COPY . ./
EXPOSE 5000