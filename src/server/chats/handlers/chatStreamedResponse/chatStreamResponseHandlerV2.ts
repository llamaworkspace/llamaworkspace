import { prisma } from '@/server/db'
import { errorLogger } from '@/shared/errors/errorLogger'
import type { NextRequest, NextResponse } from 'next/server'
import { saveTokenCountForChatRunService } from '../../services/saveTokenCountForChatRun.service'
import { handleChatTitleCreate } from './chatStreamedResponseHandlerUtils'
import {
  attachAppConfigVersionToChat,
  createChatRun,
  deleteMessage,
  getChatOrThrow,
  getNeededData,
  getParsedBodyOrThrow,
  getSessionOrThrow,
  updateMessage,
} from './chatStreamedResponseUtils'

import { ensureError } from '@/lib/utils'
import createHttpError from 'http-errors'
import { tempAppEngineRunner } from './tempAppEngineRunner'

export default async function chatStreamedResponseHandlerV2(
  req: NextRequest,
  res: NextResponse,
) {
  let tokenResponse = ''
  let assistantTargetMessageId: string | undefined = undefined
  const { chatId } = await getParsedBodyOrThrow(req)
  const session = await getSessionOrThrow()

  const userId = session.user.id

  const chat = await getChatOrThrow(prisma, userId, chatId)
  const workspaceId = chat.app.workspaceId

  // Test: Uses the right config version
  // Test: Adds all messages as context to the stream
  const {
    appConfigVersion,
    messages,
    allUnprocessedMessages,
    preparedMessages: { allMessages, assistantTargetMessage },
    model: { model, providerKVs, providerSlug },
  } = await getNeededData(prisma, userId, chatId)

  assistantTargetMessageId = assistantTargetMessage.id
  // TODO!!!!!
  // Aqui hay acople con el modelo de la aplicacion
  // En Assistants eso yo no importa, lo puede definir el assistant.
  // Test: Write something
  // await validateModelIsEnabledOrThrow(
  //   workspaceId,
  //   userId,
  //   appConfigVersion.model,
  // )

  // TEST ME OUT
  if (!chat.appConfigVersionId) {
    await attachAppConfigVersionToChat(prisma, chatId, appConfigVersion.id)
  }

  const chatRun = await createChatRun(
    prisma,
    chatId,
    allUnprocessedMessages.map((m) => m.id),
  )
  // TODO: Improve, This is ugly: What if it is a transaction and it fails?
  // it is placed here very un-nicely
  // are errors captured?
  // This should run on a high priority queue
  void handleChatTitleCreate(prisma, workspaceId, userId, chatId)

  const onFinal = async (final: string) => {
    await updateMessage(prisma, assistantTargetMessage.id, final)
    await saveTokenCountForChatRunService(prisma, chatRun.id)
  }

  const onToken = (token: string) => {
    tokenResponse += token
  }

  // PÉSIMA GESTIÓN DE ERRORES
  const onError = async (error: Error) => {
    await deleteMessage(prisma, assistantTargetMessage.id)
    errorLogger(error)
  }

  try {
    return await tempAppEngineRunner(
      providerSlug,
      allMessages,
      model,
      providerKVs,
      onToken,
      onFinal,
    )
  } catch (_error) {
    const error = ensureError(_error)
    if (tokenResponse.length && assistantTargetMessageId) {
      await updateMessage(prisma, assistantTargetMessageId, tokenResponse)
    } else if (assistantTargetMessageId) {
      await deleteMessage(prisma, assistantTargetMessageId)
    }

    errorLogger(error)
    throw createHttpError(403, error.message)
  }
}
