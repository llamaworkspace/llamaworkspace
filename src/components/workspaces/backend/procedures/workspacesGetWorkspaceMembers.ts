import { getEnumByValue } from '@/lib/utils'
import { createUserOnWorkspaceContext } from '@/server/auth/userOnWorkspaceContext'
import { protectedProcedure } from '@/server/trpc/trpc'
import { getWorkspaceOwnerService } from '@/server/workspaces/services/getWorkspaceOwner.service'
import { UserRole } from '@/shared/globalTypes'
import { z } from 'zod'
import {
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
            role: true,
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

    const context = await createUserOnWorkspaceContext(
      ctx.prisma,
      input.workspaceId,
      userId,
    )

    await context.isAdminOrThrow()

    const workspaceOwner = await getWorkspaceOwnerService(ctx.prisma, context)

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
      role: getEnumByValue(UserRole, userOfWorkspace.role),
      isOwner: userOfWorkspace.user.id === workspaceOwner.id,
    }))

    const invitedMembers = invites.map((invite) => ({
      inviteId: invite.id,
      name: null,
      email: invite.email,
      role: UserRole.Member,
      isOwner: false,
    }))

    return [...members, ...invitedMembers]
  })
