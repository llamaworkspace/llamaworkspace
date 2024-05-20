import { prisma } from '@/server/db'
import { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { AssistantResponse } from 'ai'
import createHttpError from 'http-errors'
import OpenAI from 'openai'
import type { MessageCreateParams } from 'openai/resources/beta/threads/messages'
import { z } from 'zod'
import type { Strategy } from './runnersBase'

const message = {
  role: 'user',
  content: 'What is the meaning of life?',
} as MessageCreateParams

const constructorParams = z
  .object({
    apiKey: z.string(),
    baseURL: z.string().optional(),
  })
  .strict()

const streamParams = z
  .object({
    assistantId: z.string(),
  })
  .strict()

class KeyValueStore {
  private readonly prisma: PrismaClientOrTrxClient
  private readonly postId: string
  constructor(prisma: PrismaClientOrTrxClient, postId: string) {
    this.prisma = prisma
    this.postId = postId
  }

  async get(key: string) {
    return await Promise.resolve()
    // return this.prisma.keyValueStore.findFirst({
    //   where: {
    //     key,
    //     postId: this.postId,
    //   },
    // })
  }

  async set(key: string, value: string) {
    return await Promise.resolve()
    // return this.prisma.keyValueStore.upsert({
    //   data: {
    //     key,
    //     value,
    //     postId: this.postId,
    //   },
    // })
  }
}

type OpenAiAssistantStrategyConstructorParams = z.infer<
  typeof constructorParams
>
type OpenAiAssistantStrategyStreamParams = z.infer<typeof streamParams>

export class OpenaiAssistantStrategy
  implements Strategy<OpenAiAssistantStrategyStreamParams>
{
  private readonly apiKey: string
  private readonly baseURL: string | undefined
  private readonly kvStore: KeyValueStore

  static validateConstructorParamsOrThrow(params: unknown) {
    return constructorParams.parse(params)
  }

  constructor(params: OpenAiAssistantStrategyConstructorParams) {
    this.apiKey = params.apiKey
    this.baseURL = params.baseURL
    this.kvStore = new KeyValueStore(prisma, 'postId')
  }

  async stream(
    payload: OpenAiAssistantStrategyStreamParams,
    // context: StrategyStreamContext,
  ) {
    // const { keyValues } = context
    const openai = new OpenAI({ apiKey: this.apiKey, baseURL: this.baseURL })
    // await main(openai)
    const thread = await openai.beta.threads.create({})
    const threadId = thread.id

    const createdMessage = await openai.beta.threads.messages.create(
      threadId,
      message,
    )

    return AssistantResponse(
      {
        threadId,
        messageId: createdMessage.id,
      },

      async ({ forwardStream }) => {
        const runStream = openai.beta.threads.runs.stream(threadId, {
          assistant_id: payload.assistantId,
        })

        // forward run status would stream message deltas
        const runResult = await forwardStream(runStream)
        // runResult.status can be: queued, in_progress, requires_action, cancelling, cancelled, failed, completed, or expired

        if (!runResult) {
          throw new Error('Run result is undefined')
        }

        while (runResult.status === 'requires_action') {}

        // if (['completed', 'cancelled'].includes(runResult.status)) {
        //   onFinal(runResult)
        // }

        if (runResult.status === 'failed') {
          const error = createHttpError(403, 'Run failed')
          error.payload = runResult
          // onError(error)
        }
      },
    )
  }

  async create(context) {
    const { kvStore, payload } = context

    const openai = new OpenAI({ apiKey: this.apiKey, baseURL: this.baseURL })

    const assistant = await openai.beta.assistants.create({
      name: `Llama_Workspace_assistant_${Math.random().toString()}_DO_NOT_DELETE`,
      instructions:
        'You are a personal math tutor. Write and run code to answer math questions.',
      tools: [],
      model: 'gpt-4o',
    })
  }

  validateStreamInputParams(params: OpenAiAssistantStrategyStreamParams) {
    return streamParams.safeParse(params)
  }
}
