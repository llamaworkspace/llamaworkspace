export interface AppHttpErrorPayload {
  code: string
  message: string
  isAppError: true
}

export class AppClientError extends Error {
  code: string
  constructor(code: string, message: string) {
    super(message)
    this.code = code
  }
}
