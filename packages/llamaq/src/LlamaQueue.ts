export abstract class AbstractQueue<T> {
  public readonly queueName: string
  public readonly name: string
  private readonly inputPayload: z.ZodTypeAny

  constructor(inputPayload: z.ZodTypeAny) {
    this.queueName = 'user'
    this.name = 'user:sendEmail'
    this.inputPayload = inputPayload
  }

  async call(req: NextApiRequest) {
    let payload: T
    try {
      payload = this.inputPayload.parse(req.body) as T
    } catch (error) {
      // Handle error
      throw new Error('Invalid payload')
    }

    await this.handler(payload)
  }
  abstract handler(payload: unknown): Promise<void>
}

export class LlamaQHandler {
  constructor(private readonly queues: Class<ClassAbstractQueue<unknown>>[]) {}
}

class SendEmailQueue extends AbstractQueue<{ userId: string }> {
  async handler(payload: { userId: string }) {
    await Promise.resolve()
    console.log('I handle the thing here')
  }
}
