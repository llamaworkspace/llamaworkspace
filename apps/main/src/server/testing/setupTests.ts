import type chalk from 'chalk'
import { mockDeep } from 'jest-mock-extended'
import { prisma } from '../db'
// import { resetDatabase } from './resetDatabase'

beforeAll(async () => {
  // await resetDatabase(prisma)
})
afterAll(async () => {
  await prisma.$disconnect()
})

jest.mock('@/server/messaging/mailer', () => {
  return {
    sendEmail: jest.fn(),
  }
})

jest.mock('@/server/messaging/EmailService.ts', () => {
  return jest.fn().mockImplementation(() => {
    return { sendEmail: jest.fn() }
  })
})

jest.mock('@/server/queues/queuesManager.ts', () => {
  return jest.fn().mockImplementation(() => {
    return { call: jest.fn(), registerQueue: jest.fn() }
  })
})

// This is needed to avoid a random TS error
jest.mock('chalk', () => mockDeep<typeof chalk>())

// @ts-expect-error - global fetch mocking
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  }),
)
