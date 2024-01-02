import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime'
import { AWSBedrockLlama2Stream } from 'ai'
import { experimental_buildLlama2Prompt } from 'ai/prompts'
import type {
  AiRegistryExecutePayload,
  AiRegistryProvider,
} from '../../aiRegistryTypes'
import { bedrockAiModels } from './lib/bedrockAiModels'

interface BedrockExecuteOptions {
  awsAccessKeyId: string
  awsSecretAccessKey: string
  awsRegion?: string
}

export const BedrockProvider: () => AiRegistryProvider = () => {
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
}
