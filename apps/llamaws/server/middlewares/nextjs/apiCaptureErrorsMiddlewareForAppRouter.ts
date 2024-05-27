import createHttpError from 'http-errors'
import { NextResponse } from 'next/server'
import { errorLogger } from 'shared/errors/errorLogger'

export const apiCaptureErrorsMiddlewareForAppRouter = (error: Error) => {
  if (createHttpError.isHttpError(error) && error.status < 500) {
    return NextResponse.json(
      { message: error.message, isAppError: true },
      { status: error.status },
    )
  }

  errorLogger(error)

  return NextResponse.json(
    { message: 'Internal Server Error', isAppError: true },
    { status: 500 },
  )
}
