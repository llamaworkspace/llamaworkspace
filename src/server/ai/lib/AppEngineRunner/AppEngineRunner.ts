import { AppEngineType } from '@/components/apps/appsTypes'
import {
  UserOnWorkspaceContext,
  createUserOnWorkspaceContext,
} from '@/server/auth/userOnWorkspaceContext'
import { getChatByIdService } from '@/server/chats/services/getChatById.service'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import createHttpError from 'http-errors'
import type { AbstractAppEngine } from '../AbstractAppEngine'
import { AppEnginePayloadBuilder } from './AppEnginePayloadBuilder'

export class AppEngineRunner {
  private contextCache = new Map<
    string,
    ReturnType<typeof createUserOnWorkspaceContext>
  >()

  constructor(
    private readonly prisma: PrismaClientOrTrxClient,
    private readonly engines: AbstractAppEngine[],
  ) {}

  async call(userId: string, chatId: string) {
    const context = await this.createContext(chatId, chatId)
    const engineType = await this.getEngineType(context, chatId)

    if (!engineType) {
      throw createHttpError(500, 'engineType is not yet set')
    }

    if (engineType !== AppEngineType.Default.toString()) {
      throw createHttpError(500, 'non-default engineType is not yet supported')
    }

    const engine = this.getDefaultEngine()
    const ctx = await this.generateEngineRuntimeContext(context, userId, chatId)

    return await engine.run(ctx)
  }

  private getDefaultEngine() {
    const engine = this.engines.find(
      (engine) => engine.getName() === AppEngineType.Default.toString(),
    )
    if (!engine) {
      throw createHttpError(500, `Default engine not found`)
    }
    return engine
  }

  private async getEngineType(
    uowContext: UserOnWorkspaceContext,
    chatId: string,
  ) {
    const chat = await getChatByIdService(this.prisma, uowContext, {
      chatId,
      includeApp: true,
    })

    return chat.app.engineType
  }

  private async generateEngineRuntimeContext(
    uowContext: UserOnWorkspaceContext,
    userId: string,
    chatId: string,
  ) {
    const appEnginePayloadBuilder = new AppEnginePayloadBuilder(
      this.prisma,
      uowContext,
    )
    return await appEnginePayloadBuilder.call(chatId)
  }

  private async createContext(workspaceId: string, userId: string) {
    return await createUserOnWorkspaceContext(this.prisma, workspaceId, userId)
  }
}
