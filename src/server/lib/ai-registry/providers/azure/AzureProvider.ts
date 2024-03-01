import { OpenAIStream } from 'ai'
import {
  experimental_buildAnthropicPrompt,
  experimental_buildLlama2Prompt,
  experimental_buildOpenAssistantPrompt,
} from 'ai/prompts'
import OpenAI, { ClientOptions } from 'openai'
import type {
  AiRegistryExecutePayload,
  AiRegistryMessage,
  AiRegistryProvider,
} from '../../aiRegistryTypes'
import { OpenAiExecuteOptions } from '../openai/lib/openAiProviderTypes'
import { azureAiModels } from './lib/azureAiModels'

interface AzureExecuteOptions {
  awsAccessKeyId: string
  awsSecretAccessKey: string
  awsRegion?: string
}

export const AzureProvider = (): AiRegistryProvider => {
  return {
    slug: 'azure' as const,
    publicName: 'Microsoft Azure' as const,
    models: azureAiModels,
    fields: [
      // {
      //   slug: 'awsAccessKeyId',
      //   publicName: 'AWS Access Key ID',
      //   required: true,
      //   encrypted: true,
      // },
      // {
      //   slug: 'awsSecretAccessKey',
      //   publicName: 'AWS Secret Access Key',
      //   required: true,
      //   encrypted: true,
      // },
      // {
      //   slug: 'awsRegion',
      //   publicName: 'AWS Region (defaults to "us-east-1")',
      //   required: false,
      //   encrypted: false,
      // },
    ],

    executeAsStream: async (
      payload: AiRegistryExecutePayload,
      options: OpenAiExecuteOptions,
    ) => {
      const openAiClientPayload: ClientOptions = {
        apiKey: '', // API key here
        baseURL:
          'https://Mistral-large-ydybb-serverless.eastus2.inference.ai.azure.com/v1',
      }

      const openai = new OpenAI(openAiClientPayload)
      console.log(1, {
        model: 'azureai',
        messages: payload.messages,
        stream: true,
      })
      const aiResponse = await openai.chat.completions.create({
        model: 'azureai',
        messages: payload.messages,
        stream: true,
      })

      const stream = OpenAIStream(aiResponse, {
        onToken: payload?.onToken,
        onFinal: payload?.onFinal,
      })

      return stream
    },
  }
}

const getAiModel = (modelSlug: string) => {
  const aiModel = azureAiModels.find((model) => model.slug === modelSlug)

  if (!aiModel) {
    throw new Error(`Could not get AiModel. Unknown slug: ${modelSlug}`)
  }
  return aiModel
}

const getLLMProviderFromAzureModelSlug = (modelSlug: string) => {
  if (modelSlug.includes('llama2')) {
    return 'llama2'
  }
  if (modelSlug.includes('anthropic')) {
    return 'anthropic'
  }
  if (modelSlug.includes('cohere')) {
    return 'cohere'
  }
  throw new Error(`Cannot recognize this model name: ${modelSlug}`)
}

type LlmProvider = ReturnType<typeof getLLMProviderFromAzureModelSlug>

const buildPrompt = (
  llmProvider: LlmProvider,
  messages: AiRegistryMessage[],
) => {
  if (llmProvider === 'anthropic') {
    return experimental_buildAnthropicPrompt(messages)
  }

  if (llmProvider === 'llama2') {
    return experimental_buildLlama2Prompt(messages)
  }

  if (llmProvider === 'cohere') {
    return experimental_buildOpenAssistantPrompt(messages)
  }
}

const getStream = (
  llmProvider: LlmProvider,
  azureResponse: InvokeModelWithResponseStreamCommandOutput,
  payload: AiRegistryExecutePayload,
) => {
  if (llmProvider === 'anthropic') {
    return AzureAnthropicStream(azureResponse, {
      onToken: payload?.onToken,
      onFinal: payload?.onFinal,
    })
  }

  if (llmProvider === 'llama2') {
    return AzureLlama2Stream(azureResponse, {
      onToken: payload?.onToken,
      onFinal: payload?.onFinal,
    })
  }

  if (llmProvider === 'cohere') {
    return AzureCohereStream(azureResponse, {
      onToken: payload?.onToken,
      onFinal: payload?.onFinal,
    })
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Cannot recognize this model name: ${llmProvider}`)
}
