import { errorLogger } from '@/shared/errors/errorLogger'
import createHttpError from 'http-errors'
import type { Middleware } from 'next-api-middleware'

export const apiCaptureErrorsMiddleware: Middleware = async (
  _req,
  res,
  next,
) => {
  try {
    await next()
  } catch (error) {
    if (createHttpError.isHttpError(error) && error.status < 500) {
      error.isAppError = true
      res.status(error.status).json(error)
      return
    }
    errorLogger(error as Error)
    const nextError = new createHttpError.InternalServerError()
    nextError.isAppError = true
    res.status(nextError.status).send(nextError.message)
  }
}
