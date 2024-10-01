import { env } from '@/env.mjs'
import { PrismaClient } from '@prisma/client'
import { fieldEncryptionExtension } from 'prisma-field-encryption'
import { globalForPrisma } from './dbUtils'

const DEV_DEBUG_DB = false

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      ['development', 'test'].includes(env.NODE_ENV) && DEV_DEBUG_DB
        ? ['query', 'error', 'warn']
        : ['error'],
  }).$extends(fieldEncryptionExtension({ encryptionKey: env.ENCRYPTION_KEY }))

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
