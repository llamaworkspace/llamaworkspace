import { env } from '@/env.mjs'
import {
  AbstractAppEngine,
  type AppEngineCallbacks,
  type AppEngineParams,
} from '@/server/ai/lib/AbstractAppEngine'
import type { AiRegistryMessage } from '@/server/lib/ai-registry/aiRegistryTypes'
import OpenAI from 'openai'
import { Uploadable } from 'openai/uploads'
import { z } from 'zod'

type AiRegistryMessageWithoutSystemRole = Omit<AiRegistryMessage, 'role'> & {
  role: Exclude<AiRegistryMessage['role'], 'system'>
}

const payloadSchema = z.object({
  assistantId: z.string(),
})

type OpeniAssistantsEngineAppPayload = z.infer<typeof payloadSchema>

export class OpenaiAssistantsEngine extends AbstractAppEngine {
  getName() {
    return 'OpenaiAssistantsEngine'
  }

  getPayloadSchema() {
    return payloadSchema
  }

  async run(
    ctx: AppEngineParams<OpeniAssistantsEngineAppPayload>,
    callbacks: AppEngineCallbacks,
  ) {
    const {
      messages,
      providerSlug,
      modelSlug,
      providerKVs,
      targetAssistantRawMessage,
      chatId,
    } = ctx

    const { pushText } = callbacks

    const { kvs } = { kvs: {} }
    const openai = new OpenAI({
      // This needs to be provided at runtime
      apiKey: env.INTERNAL_OPENAI_API_KEY,
    })

    // TODO: Passs system messsage somewhere, somehow
    const messagesWithoutSystem = this.filterSystemMessage(messages)

    const thread = await openai.beta.threads.create({
      messages: messagesWithoutSystem,
    })
    const threadId = thread.id

    const response = openai.beta.threads.runs.stream(threadId, {
      // assistant_id: kvs.assistantId,
      assistant_id: 'asst_sk18bpznVq02EKXulK5S3X8L',
    })

    for await (const event of response) {
      if (event.event === 'thread.message.delta') {
        for (const item of event.data.delta.content ?? []) {
          if (item.type === 'text' && item.text?.value) {
            await pushText(item.text.value)
          }
        }
      }
      if (event.event === 'thread.run.completed') {
        const usage = event.data.usage

        await Promise.resolve(
          callbacks.usage(
            usage?.prompt_tokens ?? 0,
            usage?.completion_tokens ?? 0,
          ),
        )
      }
    }
  }

  async attachAsset(assetThing: Uploadable) {
    console.log(9)
    const assistantId = 'asst_sk18bpznVq02EKXulK5S3X8L'
    console.log('9.1')
    const assistant = await this.createOrGetOpenaiAssistant(assistantId)
    console.log('9.2')
    const vectorStoreIds =
      assistant.tool_resources?.file_search?.vector_store_ids ?? []

    let targetVectorStoreId = vectorStoreIds[0]
    console.log(10, targetVectorStoreId)
    if (!targetVectorStoreId) {
      const vectorStore = await this.createVectorStoreForAssistant(assistant.id)
      targetVectorStoreId = vectorStore.id
    }
    console.log(11)
    await this.uploadAssetToVectorStore(targetVectorStoreId, assetThing)
    console.log(12)
  }

  async removeAsset() {
    // Do nothing
  }

  private async createOrGetOpenaiAssistant(assistantId: string) {
    const openai = this.getOpenaiInstance()
    let assistant = await openai.beta.assistants.retrieve(assistantId)
    if (!assistant) {
      assistant = await this.createOpenaiAssistant()
    }
    return assistant
  }

  private async createOpenaiAssistant() {
    const openai = this.getOpenaiInstance()
    return openai.beta.assistants.create({
      model: 'gpt-4o',
      name: '(do not delete) Llamaworkspace Assistant for appId...',
      description:
        'This is an automatically created assistant for Llamaworkspace. To avoid errors in the app, please do not delete this assistant directly.',
      tools: [{ type: 'file_search' }],
    })
  }

  private async uploadAssetToVectorStore(
    vectorStoreId: string,
    fileStream: Uploadable,
  ) {
    const openai = this.getOpenaiInstance()

    const res = await openai.beta.vectorStores.fileBatches.uploadAndPoll(
      vectorStoreId,
      {
        files: [fileStream],
      },
    )
    console.log(111, res)
  }

  private async createVectorStoreForAssistant(assistantId: string) {
    const openai = this.getOpenaiInstance()
    const vectorStore = await openai.beta.vectorStores.create({
      name: `(do not delete) VectorStore for assistantId ${assistantId}`,
    })
    await openai.beta.assistants.update(assistantId, {
      tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
    })
    return vectorStore
  }

  private getOpenaiInstance() {
    return new OpenAI({
      // This needs to be provided at runtime!!!!
      apiKey: env.INTERNAL_OPENAI_API_KEY,
    })
  }

  private filterSystemMessage(messages: AiRegistryMessage[]) {
    return messages.map((message) => {
      if (message.role !== 'system') {
        return message as AiRegistryMessageWithoutSystemRole
      }
      return {
        ...message,
        role: 'user',
      } as AiRegistryMessageWithoutSystemRole
    })
  }
}
