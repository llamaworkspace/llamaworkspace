import {
  BedrockRuntimeClient,
  InvokeModelWithResponseStreamCommand,
} from '@aws-sdk/client-bedrock-runtime'
import { AWSBedrockAnthropicStream } from 'ai'
import { experimental_buildLlama2Prompt } from 'ai/prompts'

interface ExecuteOptions {
  apiKey: string
  baseUrl?: string
  onToken?: (token: string) => void
  onCompletion?: (final: string) => void
}

export const BedrockProvider = {
  slug: 'bedrock' as const,
  publicName: 'Bedrock' as const,
  models: [{ slug: 'gpt-4', publicName: 'Chat GPT-4 special edition' }],
  execute: async () =>
    // payload: ,
    // options: ExecuteOptions,
    {
      const bedrockClient = new BedrockRuntimeClient({
        region: 'us-east-1',
        credentials: {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID ?? '',
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ?? '',
        },
      })
      const messages = [
        {
          id: 'a',
          createdAt: new Date(),
          role: 'user' as const,
          content: 'how to say chair in french?',
        },
      ]

      const bedrockResponse = await bedrockClient.send(
        new InvokeModelWithResponseStreamCommand({
          modelId: 'meta.llama2-13b-chat-v1',
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify({
            prompt: experimental_buildLlama2Prompt(messages),
            max_tokens_to_sample: 300,
          }),
        }),
      )

      // Convert the response into a friendly text-stream
      const stream = AWSBedrockAnthropicStream(bedrockResponse)

      return stream
    },
}
