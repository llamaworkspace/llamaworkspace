FROM node:20.12
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/main/package.json ./apps/main/
RUN npm install -g pnpm && \
    pnpm install --ignore-scripts

# COPY packages ./packages/
COPY apps/main ./apps/main/
WORKDIR /app/apps/main
EXPOSE 5000
CMD ["pnpm", "start"]
