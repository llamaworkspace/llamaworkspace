import { AppEngineRunner } from '@/server/ai/lib/AppEngineRunner'
import { enginesRegistry } from '@/server/extensions/appEngines/appEngines'

import { prisma } from '@/server/db'
import { prismaAsTrx } from '@/server/lib/prismaAsTrx'
import { NextResponse, type NextRequest } from 'next/server'
import {
  createContext,
  getAppConfigVersionForChat,
  getChatOrThrow,
  getMessagesForChat,
  getParsedBodyOrThrow,
  getSessionOrThrow,
} from './chatStreamedResponseUtils'

export default async function chatStreamedResponseHandlerV2(
  req: NextRequest,
  res: NextResponse,
) {
  // ERROR: no puede correr todo como trx, ya que si fallan cosas del chatRun, queremos persistir los mensajes
  return await prismaAsTrx(prisma, async (prisma) => {
    // Test: passes on correct payload
    // Test: fails on incorrect payload
    const { chatId } = await getParsedBodyOrThrow(req)
    // Test: passes on correct session
    // Test: fails on incorrect session
    const session = await getSessionOrThrow()
    const userId = session.user.id

    // Test: Calls permissions verifier
    const chat = await getChatOrThrow(prisma, userId, chatId)
    const workspaceId = chat.app.workspaceId
    const context = await createContext(prisma, workspaceId, userId)

    // Test: Uses the right config version
    // Test: Adds all messages as context to the stream
    const [appConfigVersion, messages] = await Promise.all([
      await getAppConfigVersionForChat(prisma, context, chatId),
      await getMessagesForChat(prisma, chatId),
    ])

    // ME HE QUEDADO AQUI
    // Aqui hay acople con el modelo de la aplicacion
    // En Assistants eso yo no importa, lo puede definir el assistant.
    // Test: Write something
    await validateModelIsEnabledOrThrow(
      workspaceId,
      userId,
      appConfigVersion.model,
    )

    const appEngineRunner = new AppEngineRunner(prisma, enginesRegistry)
    const stream = await appEngineRunner.call(userId, chatId)

    const headers = {
      'Content-Type': 'text/plain; charset=utf-8',
    }
    return new NextResponse(stream, { headers })
  })
}
