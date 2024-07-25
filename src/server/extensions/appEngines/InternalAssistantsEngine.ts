import { AppEngineType } from '@/components/apps/appsTypes'
import { env } from '@/env.mjs'
import { readFileSafe } from '@/lib/backend/nodeUtils'
import {
  AbstractAppEngine,
  type AppEngineCallbacks,
  type AppEngineConfigParams,
  type AppEngineRunParams,
} from '@/server/ai/lib/AbstractAppEngine'
import { HfInference } from '@huggingface/inference'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai'
import { RetrievalQAChain } from 'langchain/chains'
import { Document } from 'langchain/document'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import type { Uploadable } from 'openai/uploads'
import { z } from 'zod'
const providerKeyValuesSchema = z.object({})

const appKVsSchema = z.object({}).partial()

type ProviderKeyValues = z.infer<typeof providerKeyValuesSchema>
type AppKeyValues = z.infer<typeof appKVsSchema>

const hf = new HfInference(process.env.INTERNAL_HF_KEY)

const model = new ChatOpenAI({
  apiKey: env.INTERNAL_OPENAI_API_KEY,
  model: 'gpt-4o',
})

const filePaths: string[] = ['./tmp/BOE-A-2009-4724-consolidado.pdf']

// Function to read and process files
async function processFile(filePath: string): Promise<Document> {
  console.log('Processing file', filePath)
  const content = await readFileSafe(filePath, 'utf8')

  return new Document({ pageContent: content, metadata: { source: filePath } })
}

export class InternalAssistantsEngine extends AbstractAppEngine {
  getName() {
    return AppEngineType.InternalAssistant.toString()
  }

  getProviderKeyValuesSchema() {
    return providerKeyValuesSchema
  }

  getAppKeyValuesSchema() {
    return appKVsSchema
  }

  async run(
    ctx: AppEngineRunParams<AppKeyValues, ProviderKeyValues>,
    callbacks: AppEngineCallbacks,
  ) {
    const { messages, providerKVs, chatId, appKeyValuesStore } = ctx

    const { pushText } = callbacks

    const appKvs = await appKeyValuesStore.getAll()

    // Move these to ctx and pass them as typedProviderKVs
    const typedProviderKVs = this.getTypedProviderKVsOrThrow(providerKVs)

    // 1. Get all files linked to this app and convert them to langchain documents
    const documents: Document[] = []
    // for (const filePath of filePaths) {
    //   const document = await processFile(filePath)
    //   documents.push(document)
    // }

    const loader = new PDFLoader('./tmp/BOE-A-2009-4724-consolidado.pdf')
    documents.push(await loader.load())

    // 2. Split documents into chunks
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 100,
    })

    console.log('Splitting documents...')
    const splitDocs = await textSplitter.splitDocuments(documents)
    console.log('Documents splitted...')
    // 3. Create vector store
    const vectorStore = await MemoryVectorStore.fromDocuments(
      splitDocs,
      new OpenAIEmbeddings({ apiKey: env.INTERNAL_OPENAI_API_KEY }),
    )

    // 4. Create retrieval chain
    console.log('Creating retrieval chain...')
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever())

    // 5. Run the chain
    const userMessage = 'Summarize the content of these documents.'
    console.log('Running chain...')
    const response = await chain.stream({ query: userMessage })
    for await (const chunk of response) {
      await pushText(chunk.text as string)
    }
  }

  async onAppCreated() {
    return await Promise.resolve()
  }

  async onAppDeleted(ctx: AppEngineConfigParams<AppKeyValues>) {
    // const { aiProviders, appKeyValuesStore } = ctx
    // const openaiProvider = aiProviders.openai
    // const appKvs = await appKeyValuesStore.getAll()
    // if (!openaiProvider) {
    //   throw createHttpError(500, `Provider OpenAI not found`)
    // }
    // const typedProviderKVs = this.getTypedProviderKVsOrThrow(openaiProvider)
    // const openai = this.getOpenaiInstance(
    //   typedProviderKVs.apiKey,
    //   typedProviderKVs.baseUrl,
    // )
    // const vectorStoreId = appKvs.vectorStoreId
    // if (!vectorStoreId) {
    //   throw createHttpError(500, `Vector store id not found`)
    // }
    // await this.deleteVectorStore(openai, vectorStoreId)
  }

  async onAssetAdded(
    ctx: AppEngineConfigParams<AppKeyValues>,
    uploadable: Uploadable,
    saveExternalAssetId: (externalId: string) => Promise<void>,
  ) {
    return await Promise.resolve()

    // const { appId, aiProviders, appKeyValuesStore } = ctx
    // const openaiProvider = aiProviders.openai
    // const appKvs = await appKeyValuesStore.getAll()
    // if (!openaiProvider) {
    //   throw createHttpError(500, `Provider OpenAI not found`)
    // }
    // const typedProviderKVs = this.getTypedProviderKVsOrThrow(openaiProvider)
    // const openai = this.getOpenaiInstance(
    //   typedProviderKVs.apiKey,
    //   typedProviderKVs.baseUrl,
    // )
    // const vectorStore = await this.createOrGetVectorStore(
    //   openai,
    //   appId,
    //   appKvs.vectorStoreId,
    // )
    // if (!appKvs.vectorStoreId || appKvs.vectorStoreId !== vectorStore.id) {
    //   await appKeyValuesStore.set('vectorStoreId', vectorStore.id)
    // }
    // const { file } = await this.uploadAssetToVectorStore(
    //   openai,
    //   vectorStore.id,
    //   uploadable,
    // )
    // await saveExternalAssetId(file.id)
  }

  async onAssetRemoved(
    ctx: AppEngineConfigParams<AppKeyValues>,
    externalId: string,
  ) {
    return await Promise.resolve()
    // const { aiProviders } = ctx
    // const openaiProvider = aiProviders.openai

    // if (!openaiProvider) {
    //   throw createHttpError(500, `Provider OpenAI not found`)
    // }

    // const typedProviderKVs = this.getTypedProviderKVsOrThrow(openaiProvider)

    // const openai = this.getOpenaiInstance(
    //   typedProviderKVs.apiKey,
    //   typedProviderKVs.baseUrl,
    // )

    // await openai.files.del(externalId)
  }

  private getTypedProviderKVsOrThrow(providerKVs: Record<string, string>) {
    return providerKeyValuesSchema.parse(providerKVs)
  }
}
