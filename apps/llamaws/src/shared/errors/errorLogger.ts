import { env } from '@/env.mjs'
import type { TRPCError } from '@trpc/server'
import chalk from 'chalk'

const log = (message: string) => {
  if (env.NEXT_PUBLIC_ENV === 'development') {
    console.log(message)
  }
}
const logError = (error: Error) => {
  if (env.NEXT_PUBLIC_ENV === 'development') {
    console.error(error)
  }
}

export const errorLogger = (error: Error) => {
  log(chalk.red.bold.bgWhite('  *** START: Logging error ***  '))
  logError(error)
  log(chalk.red.bold.bgWhite('  *** END: Logging error ***  '))
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
}
