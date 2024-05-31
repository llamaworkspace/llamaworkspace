import { ZodError, z, type infer as Infer, type ZodType } from 'zod'
import { AbstractQueueManager } from '../AbstractQueueManager'

global.fetch = jest.fn()

const mockedGlobalFetch = global.fetch as jest.MockedFunction<typeof fetch>

describe('AbstractQueueManager', () => {
  class TestEnqueuedEvent extends AbstractQueueManager<ZodType> {
    queueName = 'testQueue'

    protected async handle(payload: Infer<ZodType>) {
      // Dummy handle method for testing purposes
    }
  }

  const validPayloadSchema = z.object({
    key: z.string(),
  })

  let enqueuedEvent: TestEnqueuedEvent
  const hostname = 'http://my-hostname/enqueue'

  beforeEach(() => {
    enqueuedEvent = new TestEnqueuedEvent(validPayloadSchema, hostname)
    // Reset fetch mock between tests
    jest.clearAllMocks()
  })

  describe('enqueue', () => {
    it('should parse the payload and make a fetch call', async () => {
      const validPayload = { key: 'value' }

      // @ts-expect-error Mocking fetch
      mockedGlobalFetch.mockResolvedValueOnce({
        status: 200,
        ok: true,
        statusText: 'OK',
        text: jest.fn().mockResolvedValue('Success'),
      })

      await enqueuedEvent.enqueue('testAction', validPayload)

      expect(mockedGlobalFetch).toHaveBeenCalledWith(hostname, {
        method: 'POST',
        body: JSON.stringify({
          queueName: 'testQueue',
          actionName: 'testAction',
          payload: validPayload,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
    })

    it('should throw a validation error when the payload is invalid', async () => {
      const invalidPayload = { key: 123 }

      await expect(
        enqueuedEvent.enqueue('testAction', invalidPayload),
      ).rejects.toThrow(ZodError)
    })

    describe('when the remote response is not 200', () => {
      beforeEach(() => {
        // @ts-expect-error Mocking fetch
        mockedGlobalFetch.mockResolvedValueOnce({
          status: 500,
          ok: false,
          statusText: 'Internal Server Error',
          text: jest.fn().mockResolvedValue('Failed'),
        })
      })

      it('should throw an error', async () => {
        await expect(
          enqueuedEvent.enqueue('testAction', { key: 'value' }),
        ).rejects.toThrow()
      })
    })
  })
})
