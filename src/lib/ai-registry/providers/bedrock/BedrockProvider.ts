import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime'
import { AWSBedrockLlama2Stream } from 'ai'
import { experimental_buildLlama2Prompt } from 'ai/prompts'
import type { AiRegistryExecutePayload } from '../../aiRegistryTypes'
import { bedrockAiModels } from './lib/bedrockAiModels'
import type { BedrockProviderType } from './lib/openAiProviderTypes'

export const BedrockProvider: BedrockProviderType = {
  slug: 'bedrock' as const,
  publicName: 'Amazon Bedrock' as const,
  models: bedrockAiModels,
  fields: [
    {
      slug: 'apiKey',
      publicName: 'API key',
      isOptional: false,
    },
    {
      slug: 'baseUrl',
      publicName: 'Base URL',
      isOptional: true,
    },
  ],

  execute: async (payload: AiRegistryExecutePayload) => {
    // hackedValidateModelExists(payload.model)

    const bedrockClient = new BedrockRuntimeClient({
      region: 'us-east-1',
      // region: process.env.AWS_REGION ?? 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
      },
    })

    // Inference parameters:
    // https://docs.aws.amazon.com/bedrock/latest/userguide/model-parameters.html
    const bedrockResponse = await bedrockClient.send(
      new InvokeModelWithResponseStreamCommand({
        modelId: 'meta.llama2-13b-chat-v1',
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          prompt: experimental_buildLlama2Prompt(payload.messages),
          max_gen_len: 300,
        }),
      }),
    )

    const stream = AWSBedrockLlama2Stream(bedrockResponse)
    return stream
  },
}

const hackedValidateModelExists = (modelName: string) => {
  if (!bedrockAiModels.find((model) => model.slug === modelName)) {
    throw new Error(`Model ${modelName} does not exist.`)
  }
}
