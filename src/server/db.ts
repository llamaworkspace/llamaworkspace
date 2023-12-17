import { env } from '@/env.mjs'
import { PrismaClient } from '@prisma/client'
import { fieldEncryptionExtension } from 'prisma-field-encryption'

const DEV_DEBUG_DB = false
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === 'development' && DEV_DEBUG_DB
        ? ['query', 'error', 'warn']
        : ['error'],
  }).$extends(fieldEncryptionExtension({ encryptionKey: env.ENCRYPTION_KEY }))

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// env.NODE_ENV === 'development' &&
//   prisma.$on('query', (e) => {
//     if (DEV_DEBUG_DB) {
//       console.log('Query: ' + e.query)
//       console.log('Params: ' + e.params)
//       console.log('Duration: ' + e.duration + 'ms')
//     }
//   })
