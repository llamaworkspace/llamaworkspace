import { env } from '@/env.mjs'
import {
  AssistantRunner,
  OpenaiAssistantStrategy,
} from '@/runners/OpenAiAssistantRunner'
import type { NextRequest } from 'next/server'
import { z } from 'zod'

const schema = z.object({
  chatId: z.string(),
  messages: z.array(
    z.object({
      role: z.string(),
      content: z.string(),
    }),
  ),
})

type RequestBody = z.infer<typeof schema>

const body = {
  messages: [
    {
      role: 'user',
      content: '',
    },
  ],
  chatId: 'clw9ag77700b712erku3q6zat',
}

// Request type=oai_assistant
// Pick the right strategy based on the chatId
// Bring the runtime parameters from the database (zod validate them)
// Run the strategy, which will return a stream of messages

const type: 'another' | 'openai' = 'openai'

export default async function chatStreamedResponseHandlerV2(req: NextRequest) {
  // const strategy = new AssistantStrategyResolver(prisma, [
  //   OpenaiAssistantStrategy,
  //   AnotherAssistantStrategy,
  // ])

  if (type === 'openai') {
    const dbConstructorFields = await getDbConstructorFields()
    OpenaiAssistantStrategy.validateConstructorParamsOrThrow(
      dbConstructorFields,
    ) // I should enforce this!!
    const runnerStrategy = new OpenaiAssistantStrategy(dbConstructorFields)
    const assistantRunner = new AssistantRunner(runnerStrategy)

    // We fetch assistantId here. It's an internally created id, not exposed to the user
    // Who generates this id in this example where there is no file upload phase?
    // We could generate it in the creation of the gpt, or after each interaction with a getOrCreate.
    // This getOrCreate should live in the runnerStrategy, and the runnerStrategy should have access to a kv store.

    // In the UI I envision: Select app type? (a) GPT with function calling, (b) OpenAI assistant, (b) Custom RAG?. Then, for each type, we show what is possible: Function calling, twyd, etc.
    // In the UI I envision: Select app type? (a) GPT with function calling, (b) OpenAI assistant, (b) Custom RAG?. Then, for each type, we show what is possible: Function calling, twyd, etc.
    const dbRuntimeFields = await getDbRuntimeFields()
    return await assistantRunner.stream(dbRuntimeFields)
  } else {
    // const runnerStrategy = new AnotherAssistantStrategy({ pepe: 'pepe' })
    // const assistantRunner = new AssistantRunner(runnerStrategy)
    // return await assistantRunner.stream({
    //   juan: 'juan',
    // })
    // zod parse the dbFields
    // const fields = anotherStrategyParams.parse(dbFields)
    // runnerStrategy = new AnotherAssistantStrategy(fields)
  }
  throw new Error('Not implemented yet')
  // const runnerStrategy = new OpenaiAssistantStrategy({
  //   apiKey: env.INTERNAL_OPENAI_API_KEY,
  // })

  // const anotherStrategy = new AnotherAssistantStrategy({
  //   pepe: 'pepe',
  // })

  // AssistantStrategyResolver

  // const assistantRunner = new AssistantRunner(runnerStrategy)

  // return await assistantRunner.stream({
  //   assistantId: 'asst_xlWStmqHYrJC5IsxQm6D0W8t',
  // })
}

// class AssistantStrategyResolver {
//   constructor(
//     private readonly prisma: PrismaClient,
//     private readonly strategies: Strategy<unknown>[],
//   ) {}

//   async resolve(chatId: string) {
//     const postType = await this.getPostType(chatId)
//     return this.strategies[0]!
//   }

//   private async getPostType(chatId: string) {
//     const chat = await this.prisma.chat.findUniqueOrThrow({
//       where: { id: chatId },
//       include: {
//         post: true,
//       },
//     })

//     return chat?.post.type
//   }
// }

const getDbConstructorFields = async () => {
  await Promise.resolve()
  return {
    apiKey: env.INTERNAL_OPENAI_API_KEY,
  }
}

const getDbRuntimeFields = async () => {
  await Promise.resolve()
  return {
    assistantId: 'asst_xlWStmqHYrJC5IsxQm6D0W8t',
  }
}
