import { UserFactory } from '@/server/testing/factories/UserFactory'
import { UsersOnWorkspacesFactory } from '@/server/testing/factories/UsersOnWorkspacesFactory'
import { WorkspaceFactory } from '@/server/testing/factories/WorkspaceFactory'
import mockDb from '@/server/testing/mockDb'
import * as globalTypesWrapper from '@/shared/globalTypes'
import type { User, UsersOnWorkspaces, Workspace } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import {
  UserOnWorkspaceContext,
  createUserOnWorkspaceContext,
} from '../userOnWorkspaceContext'

const mockFindFirst = jest.fn()
jest.mock('@/shared/globalTypes', () => {
  const original = jest.requireActual(
    '@/shared/globalTypes',
  ) as unknown as typeof globalTypesWrapper
  return {
    ...original,
    PrismaClientOrTrxClient: jest.fn().mockImplementation(() => ({
      usersOnWorkspaces: {
        findFirst: mockFindFirst,
      },
    })),
  }
})

const subject = async (workspaceId: string, userId: string) => {
  return await createUserOnWorkspaceContext(mockDb, workspaceId, userId)
}

describe('createUserOnWorkspaceContext function', () => {
  let workspace: Workspace, user: User, userOnWorkspace: UsersOnWorkspaces

  beforeEach(() => {
    mockDb.usersOnWorkspaces.findFirst.mockClear()
    workspace = WorkspaceFactory.build()
    user = UserFactory.build({ workspaceId: workspace.id })
    userOnWorkspace = UsersOnWorkspacesFactory.build({
      userId: user.id,
      workspaceId: workspace.id,
    })
  })

  it('should return a UserOnWorkspaceContext instance when user has access', async () => {
    mockDb.usersOnWorkspaces.findFirst.mockResolvedValueOnce(userOnWorkspace)

    const result = await subject(workspace.id, user.id)

    expect(result._type).toEqual('UserOnWorkspaceContext')
    expect(result.workspaceId).toEqual(workspace.id)
    expect(result.userId).toEqual(user.id)
  })

  describe('when user lacks access', () => {
    it('should throw a TRPCError with code "UNAUTHORIZED"', async () => {
      mockDb.usersOnWorkspaces.findFirst.mockResolvedValueOnce(null)

      const promise = subject(workspace.id, user.id)
      await expect(promise).rejects.toThrow(TRPCError)
      await expect(promise).rejects.toHaveProperty('code', 'UNAUTHORIZED')
      await expect(promise).rejects.toEqual(
        expect.objectContaining({
          message: 'You do not have the permissions to perform this action',
        }),
      )
    })
  })
})

describe('UserOnWorkspaceContext class', () => {
  const workspaceId = 'workspace-class-test-id'
  const userId = 'user-class-test-id'

  it('create method should return an instance of UserOnWorkspaceContext', () => {
    const context = UserOnWorkspaceContext.create(mockDb, workspaceId, userId)

    expect(context).toBeInstanceOf(UserOnWorkspaceContext)
    expect(context.workspaceId).toBe(workspaceId)
    expect(context.userId).toBe(userId)
  })

  it('isContext method should validate instances correctly', () => {
    const context = UserOnWorkspaceContext.create(mockDb, workspaceId, userId)
    const notContext = { workspaceId, userId }

    expect(context.isContext(context)).toBeTruthy()
    expect(context.isContext(notContext)).toBeFalsy()
  })

  describe('isAdmin method', () => {
    let context: UserOnWorkspaceContext

    beforeEach(() => {
      context = UserOnWorkspaceContext.create(mockDb, workspaceId, userId)
    })

    it('should return true when user is an admin', async () => {
      const userOnWorkspace = UsersOnWorkspacesFactory.build({
        userId,
        workspaceId,
        role: globalTypesWrapper.UserRole.Admin,
      })
      mockDb.usersOnWorkspaces.findFirst.mockResolvedValueOnce(userOnWorkspace)

      const result = await context.isAdmin()

      expect(result).toBeTruthy()
    })

    it('should return false when user is not an admin', async () => {
      const userOnWorkspace = UsersOnWorkspacesFactory.build({
        userId,
        workspaceId,
        role: globalTypesWrapper.UserRole.Member,
      })
      mockDb.usersOnWorkspaces.findFirst.mockResolvedValueOnce(userOnWorkspace)

      const result = await context.isAdmin()

      expect(result).toBeFalsy()
    })
  })

  describe('isAdminOrThrow method', () => {
    let context: UserOnWorkspaceContext

    beforeEach(() => {
      context = UserOnWorkspaceContext.create(mockDb, workspaceId, userId)
    })

    it('should return true when user is an admin', async () => {
      const userOnWorkspace = UsersOnWorkspacesFactory.build({
        userId,
        workspaceId,
        role: globalTypesWrapper.UserRole.Admin,
      })
      mockDb.usersOnWorkspaces.findFirst.mockResolvedValueOnce(userOnWorkspace)

      const result = await context.isAdminOrThrow()

      expect(result).toBeTruthy()
    })

    it('should throw a TRPCError with code "UNAUTHORIZED" when user is not an admin', async () => {
      const userOnWorkspace = UsersOnWorkspacesFactory.build({
        userId,
        workspaceId,
        role: globalTypesWrapper.UserRole.Member,
      })
      mockDb.usersOnWorkspaces.findFirst.mockResolvedValueOnce(userOnWorkspace)

      const promise = context.isAdminOrThrow()

      await expect(promise).rejects.toThrow(TRPCError)
      await expect(promise).rejects.toHaveProperty('code', 'UNAUTHORIZED')
      await expect(promise).rejects.toEqual(
        expect.objectContaining({
          message: 'Only admins can perform this action',
        }),
      )
    })
  })
})
