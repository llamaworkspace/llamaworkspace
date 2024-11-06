FROM node:20.12
WORKDIR /app

# Copy root workspace files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Copy the main app package.json
COPY apps/main/package.json ./apps/main/

# Install dependencies
RUN npm install -g pnpm && \
    pnpm install --ignore-scripts

# Copy workspace packages and main app files
# COPY packages ./packages/
COPY apps/main ./apps/main/

# Build the main app
RUN cd apps/main && pnpm build

# Set working directory to main app
WORKDIR /app/apps/main

EXPOSE 5000

CMD ["pnpm", "start"]