import { UserRole, type PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { TRPCError } from '@trpc/server'

// Use this class as a guarantee that the user is a member of the workspace.
export class UserOnWorkspaceContext {
  private _tag = 'UserOnWorkspaceContext' as const

  static create(
    prisma: PrismaClientOrTrxClient,
    workspaceId: string,
    userId: string,
  ): UserOnWorkspaceContext {
    return new UserOnWorkspaceContext(prisma, workspaceId, userId)
  }

  private constructor(
    private readonly _prisma: PrismaClientOrTrxClient,
    private readonly _workspaceId: string,
    private readonly _userId: string,
  ) {}

  isContext(obj: unknown): obj is UserOnWorkspaceContext {
    return (obj as UserOnWorkspaceContext)._tag === this._tag
  }

  get workspaceId() {
    return this._workspaceId
  }
  get userId() {
    return this._userId
  }

  get _type() {
    return this.constructor.name
  }

  async isAdmin() {
    const userOnWorkspace = await this._prisma.usersOnWorkspaces.findFirst({
      where: {
        userId: this._userId,
        workspaceId: this._workspaceId,
      },
    })
    if (!userOnWorkspace) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `There is no user on workspace for this workspace: ${this._workspaceId} and user: ${this._userId}`,
      })
    }

    return userOnWorkspace.role === UserRole.Admin.toString()
  }

  async isAdminOrThrow() {
    if (!(await this.isAdmin())) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'Only admins can perform this action',
      })
    }
    return true
  }
}

export async function createUserOnWorkspaceContext(
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  userId: string,
) {
  const hasAccess = await hasUserAccessToWorkspace(prisma, workspaceId, userId)

  if (!hasAccess) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You do not have the permissions to perform this action',
    })
  }
  return UserOnWorkspaceContext.create(prisma, workspaceId, userId)
}

const hasUserAccessToWorkspace = async (
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  userId: string,
) => {
  const workspace = await prisma.usersOnWorkspaces.findFirst({
    where: {
      userId,
      workspaceId,
    },
  })

  return !!workspace
}
