import { env } from '@/env.mjs'
import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { AssistantResponse, StreamingTextResponse } from 'ai'
import OpenAI from 'openai'
import type { AbstractAppEngine } from './BaseEngine'

export class AppEngineRunner {
  constructor(
    private readonly prisma: PrismaClientOrTrxClient,
    private readonly engines: AbstractAppEngine[],
  ) {}

  async call(chatId: string) {
    let engineName = await this.getEngineNameFromChatId(chatId)
    engineName = 'OpenaiBasicEngine'

    if (!engineName) {
      throw new Error('EngineName not found')
    }

    const engine = this.getEngineByName(engineName)
    const engineRuntimeContext = await this.generateEngineRuntimeContext(chatId)
    const streamOrSomethingElse = await engine.run(engineRuntimeContext)

    if (streamOrSomethingElse instanceof ReadableStream) {
      const headers = {
        'Content-Type': 'text/event-stream',
      }

      return new StreamingTextResponse(streamOrSomethingElse, { headers })
    }
    return streamOrSomethingElse
  }

  private getEngineByName(name: string) {
    const engine = this.engines.find((engine) => engine.getName() === name)
    if (!engine) {
      throw new Error(`Engine ${name} not found`)
    }
    return engine
  }

  private async getEngineNameFromChatId(chatId: string) {
    const chat = await this.prisma.chat.findUniqueOrThrow({
      where: {
        id: chatId,
      },
      include: {
        app: true,
      },
    })

    return chat.app.gptEngine
  }

  private async generateEngineRuntimeContext(chatId: string) {
    const { app, ...chat } = await this.prisma.chat.findUniqueOrThrow({
      where: {
        id: chatId,
      },
      include: {
        app: true,
      },
    })
    return {
      chat,
      app,
    }
  }
}

async function openaiThing() {
  const openai = new OpenAI({
    // This needs to be provided at runtime
    apiKey: env.INTERNAL_OPENAI_API_KEY,
  })

  const thread = await openai.beta.threads.create({})
  const threadId = thread.id

  const createdMessage = await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: 'Say "soy juan el del Assistant"',
  })

  return AssistantResponse(
    {
      threadId,
      messageId: createdMessage.id,
    },

    async ({ forwardStream }) => {
      const runStream = openai.beta.threads.runs.stream(threadId, {
        assistant_id: 'asst_sk18bpznVq02EKXulK5S3X8L',
      })

      await forwardStream(runStream)
    },
  )
}
