import { label } from 'next-api-middleware'
import { apiCaptureErrorsMiddleware } from './nextjs/apiCaptureErrorsMiddleware'

// Todo: Check all the libraries in lib/ and see if they need to be updated to use this.
const withMiddleware = label(
  {
    sentry: apiCaptureErrorsMiddleware,
  },
  ['sentry'],
)

export { withMiddleware }
