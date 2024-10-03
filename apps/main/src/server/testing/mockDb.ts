import type { prisma } from '@/server/db'
import { mockDeep, mockReset } from 'jest-mock-extended'

beforeEach(() => {
  mockReset(mockDb)
  mockDb.$transaction.mockImplementation(async (func) => {
    await func(mockDb)
  })
})

const mockDb = mockDeep<typeof prisma>()

export default mockDb
