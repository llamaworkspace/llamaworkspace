import { prisma } from '../db'
// import { resetDatabase } from './resetDatabase'

beforeAll(async () => {
  // await resetDatabase(prisma)
})
afterAll(async () => {
  await prisma.$disconnect()
})

jest.mock('@/server/mailer/mailer', () => {
  return {
    sendEmail: jest.fn(),
  }
})

// @ts-expect-error - global fetch mocking
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
  }),
)
