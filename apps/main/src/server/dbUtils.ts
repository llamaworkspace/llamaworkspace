import type { PrismaClient } from '@prisma/client'
import type { PrismaClient as PgVectorPrismaClient } from 'prisma/pgvector-prisma-client'

export const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
  vectorDb: PgVectorPrismaClient
}
