import type { PrismaClientOrTrxClient } from '@/shared/globalTypes'
import { TRPCError } from '@trpc/server'

// Use this class as a guarantee that the user is a member of the workspace.
export class UserOnWorkspaceContext {
  private _tag = 'UserOnWorkspaceContext' as const

  static create(workspaceId: string, userId: string): UserOnWorkspaceContext {
    return new UserOnWorkspaceContext(workspaceId, userId)
  }

  private constructor(
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
}

export async function createUserOnWorkspaceContext(
  prisma: PrismaClientOrTrxClient,
  workspaceId: string,
  userId: string,
) {
  const hasAccess = await hasUserAccessToWorkspace(prisma, userId, workspaceId)
  if (!hasAccess) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You do not have enough permissions to perform this action',
    })
  }
  return UserOnWorkspaceContext.create(workspaceId, userId)
}

const hasUserAccessToWorkspace = async (
  prisma: PrismaClientOrTrxClient,
  userId: string,
  workspaceId: string,
) => {
  const workspace = await prisma.usersOnWorkspaces.findFirst({
    where: {
      userId,
      workspaceId,
    },
  })

  return !!workspace
}
