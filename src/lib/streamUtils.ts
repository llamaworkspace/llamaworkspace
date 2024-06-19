import { ensureError } from '@/lib/utils'

interface SafeReadableStreamPipeCallbacks<T> {
  onChunk?: (chunk?: T) => void | Promise<(chunk?: T) => void>
  onError?: (error: Error) => void | Promise<(error: Error) => void>
  onEnd?: () => void | Promise<() => void>
}

export const safeReadableStreamPipe = <T>(
  stream: ReadableStream<T>,
  callbacks?: SafeReadableStreamPipeCallbacks<T>,
) => {
  const reader = stream.getReader()
  return new ReadableStream<T>({
    async start(controller) {
      try {
        while (true) {
          const { done, value } = await reader.read()
          await Promise.resolve(callbacks?.onChunk?.(value))
          if (done) {
            controller.close()
            break
          }
          controller.enqueue(value)
        }
      } catch (error) {
        await Promise.resolve(callbacks?.onError?.(ensureError(error)))
        controller.error(error)
      } finally {
        await Promise.resolve(callbacks?.onEnd?.())
        reader.releaseLock()
      }
    },
  })
}
