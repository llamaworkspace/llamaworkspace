#!/bin/sh

# Run Prisma migration
pnpm prisma migrate deploy

# Start the application
exec pnpm start