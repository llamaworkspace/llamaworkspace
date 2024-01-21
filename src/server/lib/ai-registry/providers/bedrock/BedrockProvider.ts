import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
  type InvokeModelWithResponseStreamCommandOutput,
} from '@aws-sdk/client-bedrock-runtime'
import {
  AWSBedrockAnthropicStream,
  AWSBedrockCohereStream,
  AWSBedrockLlama2Stream,
} from 'ai'
import {
  experimental_buildAnthropicPrompt,
  experimental_buildLlama2Prompt,
  experimental_buildOpenAssistantPrompt,
} from 'ai/prompts'
import type {
  AiRegistryExecutePayload,
  AiRegistryMessage,
  AiRegistryProvider,
} from '../../aiRegistryTypes'
import { bedrockAiModels } from './lib/bedrockAiModels'

interface BedrockExecuteOptions {
  awsAccessKeyId: string
  awsSecretAccessKey: string
  awsRegion?: string
}

export const BedrockProvider = (): AiRegistryProvider => {
  return {
    slug: 'bedrock' as const,
    publicName: 'Amazon Bedrock' as const,
    models: bedrockAiModels,
    fields: [
      {
        slug: 'awsAccessKeyId',
        publicName: 'AWS Access Key ID',
        required: true,
        encrypted: true,
      },
      {
        slug: 'awsSecretAccessKey',
        publicName: 'AWS Secret Access Key',
        required: true,
        encrypted: true,
      },
      {
        slug: 'awsRegion',
        publicName: 'AWS Region (defaults to "us-east-1")',
        required: false,
        encrypted: false,
      },
    ],

    executeAsStream: async (
      payload: AiRegistryExecutePayload,
      options: BedrockExecuteOptions,
    ) => {
      const bedrockClient = new BedrockRuntimeClient({
        region: options.awsRegion ?? 'us-east-1',
        credentials: {
          accessKeyId: options.awsAccessKeyId,
          secretAccessKey: options.awsSecretAccessKey,
        },
      })

      const aiModel = getAiModel(payload.model)
      const defaultPayload = aiModel.defaultPayload ?? {}

      const llmProvider = getLLMProviderFromBedrockModelSlug(payload.model)

      // Inference parameters:
      // https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters.html
      const bedrockResponse = await bedrockClient.send(
        new InvokeModelWithResponseStreamCommand({
          modelId: payload.model,
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify({
            prompt: buildPrompt(llmProvider, payload.messages),
            ...defaultPayload,
          }),
        }),
      )

      return getStream(llmProvider, bedrockResponse, payload)
    },
  }
}

const getAiModel = (modelSlug: string) => {
  const aiModel = bedrockAiModels.find((model) => model.slug === modelSlug)

  if (!aiModel) {
    throw new Error(`Could not get AiModel. Unknown slug: ${modelSlug}`)
  }
  return aiModel
}

const getLLMProviderFromBedrockModelSlug = (modelSlug: string) => {
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

type LlmProvider = ReturnType<typeof getLLMProviderFromBedrockModelSlug>

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
  bedrockResponse: InvokeModelWithResponseStreamCommandOutput,
  payload: AiRegistryExecutePayload,
) => {
  if (llmProvider === 'anthropic') {
    return AWSBedrockAnthropicStream(bedrockResponse, {
      onToken: payload?.onToken,
      onFinal: payload?.onFinal,
    })
  }

  if (llmProvider === 'llama2') {
    return AWSBedrockLlama2Stream(bedrockResponse, {
      onToken: payload?.onToken,
      onFinal: payload?.onFinal,
    })
  }

  if (llmProvider === 'cohere') {
    return AWSBedrockCohereStream(bedrockResponse, {
      onToken: payload?.onToken,
      onFinal: payload?.onFinal,
    })
  }
  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Cannot recognize this model name: ${llmProvider}`)
}
