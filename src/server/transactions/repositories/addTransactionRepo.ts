import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { TRPCError } from '@trpc/server'
import _ from 'underscore'
import { TrxAccount, TrxType } from '../transactionTypes'

interface TrxRecord {
  account: TrxAccount
  amountInCents?: number
  amountInNanoCents?: number
}

interface GeneratePayloadParams {
  from: TrxRecord | TrxRecord[]
  to: TrxRecord | TrxRecord[]
}

interface GeneratePayloadItemParams {
  trxRecord: TrxRecord
  type: TrxType
}

function generatePayloadItem(
  params: GeneratePayloadItemParams,
  userId?: string,
) {
  const { trxRecord, type } = params
  const { account, amountInCents } = trxRecord
  let { amountInNanoCents } = trxRecord

  if (amountInCents && amountInNanoCents) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'amountInCents and amountInNanoCents are mutually exclusive',
    })
  }

  if (!amountInCents && !amountInNanoCents) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'amountInCents or amountInNanoCents is required',
    })
  }

  if (account.startsWith('user_') && !userId) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'userId is required for user_* accounts',
    })
  }

  if (amountInCents) {
    amountInNanoCents = amountInCents * 10_000_000
  }
  return {
    userId,
    type,
    account,
    amountInNanoCents: amountInNanoCents!,
  }
}

type PayloadItemType = ReturnType<typeof generatePayloadItem>

const ensureTotalsMatchOrThrow = (
  from: PayloadItemType[],
  to: PayloadItemType[],
) => {
  const fromTotal = from.reduce(
    (total, trxRecord) => total + trxRecord.amountInNanoCents,
    0,
  )
  const toTotal = to.reduce(
    (total, trxRecord) => total + trxRecord.amountInNanoCents,
    0,
  )
  if (fromTotal !== toTotal) {
    throw new Error('from and to totals do not match')
  }

  return true
}

const generatePayload = (
  { from, to }: GeneratePayloadParams,
  userId?: string,
) => {
  if (!_.isArray(from)) {
    from = [from]
  }
  if (!_.isArray(to)) {
    to = [to]
  }

  const processedFrom = from.map((trxRecord) =>
    generatePayloadItem({ trxRecord, type: TrxType.Debit }, userId),
  )

  const processedTo = to.map((trxRecord) =>
    generatePayloadItem({ trxRecord, type: TrxType.Credit }, userId),
  )

  ensureTotalsMatchOrThrow(processedFrom, processedTo)

  return [...processedFrom, ...processedTo]
}

interface AddTransactionRepoInput {
  workspaceId: string
  from: TrxRecord | TrxRecord[]
  to: TrxRecord | TrxRecord[]
  userId?: string
  description?: string
}

export const addTransactionRepo = async (
  prisma: PrismaClientOrTrxClient,
  input: AddTransactionRepoInput,
) => {
  const { from, to, workspaceId, userId, description } = input

  const payload = generatePayload({ from, to }, userId)
  const workspaceAmount = payload.reduce((total, trxRecord) => {
    if (trxRecord.account === TrxAccount.WorkspaceBalance) {
      if (trxRecord.type === TrxType.Debit) {
        return total - trxRecord.amountInNanoCents
      } else {
        return total + trxRecord.amountInNanoCents
      }
    }
    return total
  }, 0)

  return await prismaAsTrx(prisma, async (prisma) => {
    await prisma.transaction.create({
      data: {
        trxDate: new Date(),
        workspaceId,
        description,
        transactionEntries: {
          create: payload,
        },
      },
    })

    await prisma.workspace.update({
      data: {
        balanceInNanoCents: {
          increment: workspaceAmount,
        },
      },
      where: {
        id: workspaceId,
      },
    })
  })
}
