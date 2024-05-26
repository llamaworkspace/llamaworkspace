import { PrismaClient } from '@prisma/client'
import { env } from 'env.mjs'
import { fieldEncryptionExtension } from 'prisma-field-encryption'

const DEV_DEBUG_DB = false
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      ['development', 'test'].includes(env.NODE_ENV) && DEV_DEBUG_DB
        ? ['query', 'error', 'warn']
        : ['error'],
  }).$extends(fieldEncryptionExtension({ encryptionKey: env.ENCRYPTION_KEY }))

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
