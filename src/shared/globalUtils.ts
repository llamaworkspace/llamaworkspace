import { env } from '@/env.mjs'

export const isDemoMode = env.DEMO_MODE === 'true'
export const isDevelopment = env.NODE_ENV === 'development'
export const isTest = env.NODE_ENV === 'test'
