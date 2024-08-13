import { readFileSafeAsUtf8 } from '@/lib/backend/nodeUtils'
import { UserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { Promise } from 'bluebird'
import { insertEmbeddingService } from './insertEmbeddingService'

interface RagIngestPayload {
  assetId: string
  filePath: string
}

export const ragIngestService = async (
  prisma: PrismaClientOrTrxClient,
  uowContext: UserOnWorkspaceContext,
  payload: RagIngestPayload,
) => {
  return await prismaAsTrx(prisma, async (prisma) => {
    const { userId, workspaceId } = uowContext
    const { filePath, assetId } = payload
    const text = await loadFile(filePath)

    const splitted = await splitText(text)
    await Promise.map(splitted, async (item) => {
      await insertEmbeddingService(assetId, item.pageContent)
    })
  })
}

const loadFile = async (filePath: string) => {
  return await loadAndCleanPlainText(filePath)
}

const splitText = async (text: string) => {
  return await split(text, 800, 400)
}

const loadAndCleanPlainText = async (filePath: string) => {
  return await readFileSafeAsUtf8(filePath)
}

export async function split(text: string, chunkSize = 800, chunkOverlap = 400) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  })

  const output = await splitter.createDocuments([text])
  return output
}
