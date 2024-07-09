import {
  AbstractAppEngine,
  type AppEngineCallbacks,
  type AppEngineConfigParams,
  type AppEngineRunParams,
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

const providerKeyValuesSchema = z.object({
  apiKey: z.string(),
  baseUrl: z.string().optional(),
})

const appKVsSchema = z
  .object({
    vectorStoreId: z.string(),
  })
  .partial()

type ProviderKeyValues = z.infer<typeof providerKeyValuesSchema>
type AppKeyValues = z.infer<typeof appKVsSchema>

export class OpenaiAssistantsEngine extends AbstractAppEngine {
  getName() {
    return 'OpenaiAssistantsEngine'
  }

  getProviderKeyValuesSchema() {
    return providerKeyValuesSchema
  }

  getPayloadSchema() {
    return appKVsSchema
  }

  async run(
    ctx: AppEngineRunParams<AppKeyValues, ProviderKeyValues>,
    callbacks: AppEngineCallbacks,
  ) {
    const {
      messages,
      providerSlug,
      modelSlug,
      providerKVs,
      targetAssistantRawMessage,
      chatId,
      appKeyValuesStore,
    } = ctx

    const { pushText } = callbacks

    const appKvs = await appKeyValuesStore.getAll()

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
      appKvs.vectorStoreId,
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

  async attachAsset(
    ctx: AppEngineConfigParams<AppKeyValues>,
    uploadable: Uploadable,
    saveExternalAssetId: (externalId: string) => Promise<void>,
  ) {
    const { appId, aiProviders, appKeyValuesStore } = ctx
    const openaiProvider = aiProviders.openai

    const appKvs = await appKeyValuesStore.getAll()

    if (!openaiProvider) {
      throw createHttpError(500, `Provider OpenAI not found`)
    }

    const typedProviderKVs = this.getTypedProviderKVsOrThrow(openaiProvider)

    const openai = this.getOpenaiInstance(
      typedProviderKVs.apiKey,
      typedProviderKVs.baseUrl,
    )

    const vectorStore = await this.createOrGetVectorStore(
      openai,
      appId,
      appKvs.vectorStoreId,
    )

    if (!appKvs.vectorStoreId || appKvs.vectorStoreId !== vectorStore.id) {
      await appKeyValuesStore.set('vectorStoreId', vectorStore.id)
    }

    const { file } = await this.uploadAssetToVectorStore(
      openai,
      vectorStore.id,
      uploadable,
    )

    await saveExternalAssetId(file.id)
  }

  async removeAsset(
    ctx: AppEngineConfigParams<AppKeyValues>,
    externalId: string,
  ) {
    const { aiProviders } = ctx
    const openaiProvider = aiProviders.openai

    if (!openaiProvider) {
      throw createHttpError(500, `Provider OpenAI not found`)
    }

    const typedProviderKVs = this.getTypedProviderKVsOrThrow(openaiProvider)

    const openai = this.getOpenaiInstance(
      typedProviderKVs.apiKey,
      typedProviderKVs.baseUrl,
    )

    await openai.files.del(externalId)
  }

  private async createAssistant(
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

  private async deleteAssistant(openai: OpenAI, openaiAssistantId: string) {
    return await openai.beta.assistants.del(openaiAssistantId)
  }

  private async createOrGetVectorStore(
    openai: OpenAI,
    appId: string,
    vectorStoreId?: string,
  ) {
    if (!vectorStoreId) {
      return await this.createVectorStore(openai, appId)
    }

    return await openai.beta.vectorStores.retrieve(vectorStoreId)
  }

  private async createVectorStore(openai: OpenAI, appId: string) {
    return await openai.beta.vectorStores.create({
      name: vectorStoreCopys.getName(appId),
    })
  }

  private async uploadAssetToVectorStore(
    openai: OpenAI,
    vectorStoreId: string,
    fileStream: Uploadable,
  ) {
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

const vectorStoreCopys = {
  getName: (appId: string) => {
    return `[DO_NOT_DELETE] Llama Workspace auto-generated VectorStore. (appId: ${appId})`
  },
}
