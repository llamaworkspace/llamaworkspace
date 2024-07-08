import {
  AbstractAppEngine,
  type AppEngineCallbacks,
  type AppEngineParams,
} from '@/server/ai/lib/AbstractAppEngine'
import type { AiRegistryMessage } from '@/server/lib/ai-registry/aiRegistryTypes'
import createHttpError from 'http-errors'
import OpenAI from 'openai'
import type { Uploadable } from 'openai/uploads'
import { groupBy } from 'underscore'
import { z } from 'zod'

type AiRegistryMessageWithoutSystemRole = Omit<AiRegistryMessage, 'role'> & {
  role: Exclude<AiRegistryMessage['role'], 'system'>
}

const payloadSchema = z.object({
  assistantId: z.string(),
})

const providerKeyValuesSchema = z.object({
  apiKey: z.string(),
  baseUrl: z.string().optional(),
})

type OpeniAssistantsEngineAppPayload = z.infer<typeof payloadSchema>

export class OpenaiAssistantsEngine extends AbstractAppEngine {
  getName() {
    return 'OpenaiAssistantsEngine'
  }

  getProviderKeyValuesSchema() {
    return providerKeyValuesSchema
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
    const vsid = 'vs_CI3ISs9z5nmoaYWJw2PTe5KB'

    const typedProviderKVs = this.getTypedProviderKVsOrThrow(providerKVs)

    const openai = this.getOpenaiInstance(
      typedProviderKVs.apiKey,
      typedProviderKVs.baseUrl,
    )

    const { systemMessage, messages: messagesWithoutSystem } =
      this.filterSystemMessage(messages)
    const assistant = await this.createAssistant(
      openai,
      chatId,
      systemMessage,
      vsid,
    )

    const response = await openai.beta.threads.createAndRun({
      assistant_id: assistant.id,
      stream: true,
      thread: {
        messages: messagesWithoutSystem,
      },
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

    await this.deleteAssistant(openai, assistant.id)
  }

  async createAssistant(
    openai: OpenAI,
    chatId: string,
    systemMessage?: string,
    vectorStoreId?: string,
  ) {
    let payload: OpenAI.Beta.Assistants.AssistantCreateParams = {
      model: 'gpt-4o',
      name: assistantCopys.getName(chatId),
      description: assistantCopys.getDescription(chatId),
    }
    if (systemMessage && systemMessage.length > 0) {
      payload = {
        ...payload,
        instructions: systemMessage,
      }
    }

    if (vectorStoreId) {
      payload = {
        ...payload,
        tools: [{ type: 'file_search' }],
        tool_resources: { file_search: { vector_store_ids: [vectorStoreId] } },
      }
    }
    return await openai.beta.assistants.create(payload)
  }

  async deleteAssistant(openai: OpenAI, openaiAssistantId: string) {
    return await openai.beta.assistants.del(openaiAssistantId)
  }

  async attachAsset(
    uploadable: Uploadable,
    saveExternalAssetId: (externalId: string) => Promise<void>,
  ) {
    const assistantId = 'asst_sk18bpznVq02EKXulK5S3X8L'
    const assistant = await this.createOrGetOpenaiAssistant(assistantId)

    const vectorStoreIds =
      assistant.tool_resources?.file_search?.vector_store_ids ?? []

    let targetVectorStoreId = vectorStoreIds[0]

    if (!targetVectorStoreId) {
      const vectorStore = await this.createVectorStoreForAssistant(assistant.id)
      targetVectorStoreId = vectorStore.id
    }

    const { file } = await this.uploadAssetToVectorStore(
      targetVectorStoreId,
      uploadable,
    )

    await saveExternalAssetId(file.id)
  }

  async removeAsset(externalId: string) {
    const openai = this.getOpenaiInstance()
    await openai.files.del(externalId)
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

    const file = await openai.files.create({
      file: fileStream,
      purpose: 'assistants',
    })

    const vectorStoreUploadRes =
      await openai.beta.vectorStores.files.createAndPoll(vectorStoreId, {
        file_id: file.id,
      })

    if (vectorStoreUploadRes.status !== 'completed') {
      throw createHttpError(500, 'Failed to upload asset to vector store')
    }
    return {
      file,
      vectorStoreUpload: vectorStoreUploadRes,
    }
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

  private getTypedProviderKVsOrThrow(providerKVs: Record<string, string>) {
    return providerKeyValuesSchema.parse(providerKVs)
  }

  private getOpenaiInstance(apiKey: string, baseURL?: string) {
    return new OpenAI({ apiKey, baseURL })
  }

  private filterSystemMessage(messages: AiRegistryMessage[]) {
    const result = groupBy(messages, (message) => {
      if (message.role === 'system') {
        return 'systemMessages'
      }
      return 'messages'
    })
    return {
      systemMessage: result.systemMessages?.reduce((memo, value) => {
        return memo + '\n' + value.content
      }, ''),
      messages: result.messages as AiRegistryMessageWithoutSystemRole[],
    }
  }
}

const assistantCopys = {
  getName: (chatId: string) => {
    return `[DO_NOT_DELETE] Llamaworkspace Assistant (chatId ${chatId}`
  },
  getDescription: (chatId: string) => {
    return `This is an automatically created assistant for Llamaworkspace (chatId: ${chatId}). To avoid errors in the app, please do not delete this assistant directly, as it will be deleted automatically after it has been used.`
  },
}
