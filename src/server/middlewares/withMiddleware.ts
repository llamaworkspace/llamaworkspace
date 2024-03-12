import { label } from 'next-api-middleware'
import type { NextRequest, NextResponse } from 'next/server'
import { apiCaptureErrorsMiddleware } from './nextjs/apiCaptureErrorsMiddleware'
import { apiCaptureErrorsMiddlewareForAppRouter } from './nextjs/apiCaptureErrorsMiddlewareForAppRouter'

// Todo: Check all the libraries in lib/ and see if they need to be updated to use this.
export const withMiddleware = label(
  {
    sentry: apiCaptureErrorsMiddleware,
  },
  ['sentry'],
)

type HandlerFunc = (
  request: Request | NextRequest,
  response?: Response | NextResponse,
) => Promise<unknown>

export const withMiddlewareForAppRouter = (handler: HandlerFunc) => {
  return async (
    request: Request | NextRequest,
    response?: Response | NextResponse,
  ) => {
    try {
      return await handler(request, response)
    } catch (error) {
      return apiCaptureErrorsMiddlewareForAppRouter(error as Error)
    }
  }
}
