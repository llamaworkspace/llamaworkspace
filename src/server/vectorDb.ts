import { env } from '@/env.mjs'
import { PrismaClient } from 'prisma/pgvector-prisma-client'
import { globalForPrisma } from './dbUtils'

export const PgVectorPrismaClient = PrismaClient

const DEV_DEBUG_DB = false

export const vectorDb =
  globalForPrisma.vectorDb ||
  new PrismaClient({
    log:
      ['development', 'test'].includes(env.NODE_ENV) && DEV_DEBUG_DB
        ? ['query', 'error', 'warn']
        : ['error'],
  })

if (env.NODE_ENV !== 'production') globalForPrisma.vectorDb = vectorDb
