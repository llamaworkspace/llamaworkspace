import type {
  PrismaClientOrTrxClient,
  PrismaTrxClient,
} from '@/shared/globalTypes'
import type { PrismaClient } from '@prisma/client'

export const prismaAsTrx = async <T>(
  prisma: PrismaClientOrTrxClient,
  func: (prisma: PrismaTrxClient) => Promise<T>,
) => {
  if ('$transaction' in prisma) {
    // Not yet a transaction
    const prismaClient = prisma as PrismaClient
    return (await prismaClient.$transaction(func)) as T
  } else {
    // Already a transaction
    return await func(prisma)
  }
}
