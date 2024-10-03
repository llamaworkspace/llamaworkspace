import * as Sentry from '@sentry/nextjs'
import type { TRPCError } from '@trpc/server'
import chalk from 'chalk'

const log = (message: string) => {
  console.log(message)
}
const logError = (error: Error) => {
  console.error(error)
}

export const errorLogger = (error: Error) => {
  log(chalk.red.bold.bgWhite('  *** START: Logging error ***  '))
  logError(error)
  log(chalk.red.bold.bgWhite('  *** END: Logging error ***  '))

  Sentry.captureException(error)
}

interface ErrorLoggerForTRPCMeta {
  trpcPath?: string
  trpcType?: string
  userId?: string
}
export const errorLoggerForTRPC = (
  error: TRPCError,
  meta: ErrorLoggerForTRPCMeta,
) => {
  log(chalk.red.bold.bgWhite('  *** START: Logging error (trpc) ***  '))
  logError(error)
  log(chalk.red.bold.bgWhite('  *** END: Logging error (trpc) ***  '))

  Sentry.captureException(error, {
    tags: {
      isTRPCError: true,
      ...meta,
    },
  })
}
