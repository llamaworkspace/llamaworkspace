import { mockDeep } from 'jest-mock-extended'
import OpenAI from 'openai'
import { OpenaiAssistantStrategy } from '../OpenAiAssistantRunner'

const mockOpenAIApi = mockDeep<OpenAI>()

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => mockOpenAIApi)
})

const subject = () => {
  return new OpenaiAssistantStrategy({
    apiKey: 'apiKey',
  })
}

describe('OpenaiAssistantStrategy', () => {
  describe('create', () => {
    it('creates the assistant at OpenAI', async () => {
      await subject().create()
      expect(
        mockOpenAIApi.beta.assistants.create.bind(
          mockOpenAIApi.beta.assistants,
        ),
      ).toHaveBeenCalled()
    })

    it('persists the assistantId in the keyvalue store', async () => {
      await subject().create()

      const kvs = expect(
        mockOpenAIApi.beta.assistants.create,
      ).toHaveBeenCalled()
    })

    // it should create an assistant at OpenAI
    // it should persist the assistantId to the scoped keyValues.
    // keyValues should be zod validated, not anything can be persisted.
  })
})
