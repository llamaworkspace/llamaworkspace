import { AiRegistry } from '@/server/lib/ai-registry/AiRegistry'
import { OpenAiProvider } from '@/server/lib/ai-registry/providers/openai/OpenAiProvider'
import mockDb from '@/server/testing/mockDb'
import { AiProvidersFetcherService } from '../AiProvidersFetcher.service'

jest.mock('@/server/lib/ai-registry/AiRegistry')
jest.mock('@/server/lib/ai-registry/providers/openai/OpenAiProvider.ts')

const mockGetProvider = jest.fn()

jest.mock('../AiProvidersFetcher.service', () => {
  return {
    AiProvidersFetcherService: jest.fn().mockImplementation(() => {
      return { getProvider: mockGetProvider }
    }),
  }
})

const fakeOpenAiProviderInstance = {}
mockGetProvider.mockReturnValue(fakeOpenAiProviderInstance)

const aiRegistry = new AiRegistry([OpenAiProvider()])

describe('AiProvidersFetcherService', () => {
  beforeEach(() => {
    mockGetProvider.mockClear()
  })

  describe('getProvider', () => {
    const subject = () => {
      return new AiProvidersFetcherService(mockDb, aiRegistry).getProvider(
        'openai',
      )
    }

    it('returns the provider with the given slug', () => {
      const result = subject()
      expect(result).toEqual(fakeOpenAiProviderInstance)
      expect(mockGetProvider).toHaveBeenCalledWith('openai')
    })
  })

  describe('getFullAiProvidersMeta', () => {
    const subject = () => {
      return new AiProvidersFetcherService(
        mockDb,
        aiRegistry,
      ).getFullAiProvidersMeta()
    }

    it('returns the provider with the given slug', () => {
      const result = subject()
      expect(result).toEqual(fakeOpenAiProviderInstance)
      expect(mockGetProvider).toHaveBeenCalledWith('openai')
    })
  })
})
