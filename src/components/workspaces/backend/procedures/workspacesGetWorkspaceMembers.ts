import { protectedProcedure } from '@/server/trpc/trpc'
import { z } from 'zod'
import {
  WorkspaceMemberRole,
  workspaceVisibilityFilter,
  zodWorkspaceMemberOutput,
} from '../workspacesBackendUtils'

const zInput = z.object({
  workspaceId: z.string(),
})

export const workspacesGetWorkspaceMembers = protectedProcedure
  .input(zInput)
  .output(zodWorkspaceMemberOutput.array())
  .query(async ({ ctx, input }) => {
    const userId = ctx.session.user.id

    // Querying from workspace to avoid querying users directly
    const workspaceWithMembers = await ctx.prisma.workspace.findUniqueOrThrow({
      select: {
        id: true,
        users: {
          select: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      where: {
        id: input.workspaceId,
        ...workspaceVisibilityFilter(userId),
      },
    })

    const workspaceOwner = await ctx.prisma.usersOnWorkspaces.findFirstOrThrow({
      select: {
        userId: true,
      },
      where: {
        workspaceId: workspaceWithMembers.id,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    const invites = await ctx.prisma.workspaceInvite.findMany({
      select: {
        id: true,
        email: true,
      },
      where: {
        workspaceId: workspaceWithMembers.id,
      },
    })

    const members = workspaceWithMembers.users.map((userOfWorkspace) => ({
      id: userOfWorkspace.user.id,
      name: userOfWorkspace.user.name,
      email: userOfWorkspace.user.email,
      role:
        userOfWorkspace.user.id === workspaceOwner.userId
          ? WorkspaceMemberRole.Owner
          : WorkspaceMemberRole.Admin,
    }))

    const invitedMembers = invites.map((invite) => ({
      inviteId: invite.id,
      name: null,
      email: invite.email,
      role: WorkspaceMemberRole.Admin,
    }))

    return [...members, ...invitedMembers]
  })
