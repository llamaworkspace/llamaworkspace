import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { useSuccessToast } from '@/components/ui/toastHooks'
import { useSelf } from '@/components/users/usersHooks'
import type { ColumnDef } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { type z } from 'zod'
import {
  WorkspaceMemberRole,
  type zodWorkspaceMemberOutput,
} from '../backend/workspacesBackendUtils'
import {
  useCancelWorkspaceInvite,
  useRevokeWorkspaceMemberAccess,
  useWorkspaceMembers,
} from '../workspaceMembersHooks'
import { useCurrentWorkspace } from '../workspacesHooks'

type WorkspaceMember = z.infer<typeof zodWorkspaceMemberOutput>

export const SettingsMembersTable = () => {
  const { workspace } = useCurrentWorkspace()
  const { workspaceMembers } = useWorkspaceMembers(workspace?.id)
  const { data: self } = useSelf()
  const { mutate: revokeAccess } = useRevokeWorkspaceMemberAccess()
  const { mutate: cancelInvite } = useCancelWorkspaceInvite()
  const toast = useSuccessToast()

  const handleRevokeAccess = useCallback(
    (userId: string) => {
      if (!workspace) return

      revokeAccess({ workspaceId: workspace.id, userId })
    },
    [workspace, revokeAccess],
  )

  const handleCancelInvite = useCallback(
    (inviteId: string) => {
      if (!workspace) return

      cancelInvite(
        { inviteId },
        {
          onSuccess: () => {
            toast(undefined, 'Invite cancelled')
          },
        },
      )
    },
    [workspace, cancelInvite, toast],
  )

  const columns = useMemo<ColumnDef<WorkspaceMember>[]>(
    () => [
      {
        header: 'Name',
        accessorKey: 'name',
        size: 2,
        cell: ({ row }) => {
          return (
            <div className="flex flex-row gap-2">
              {row.original.name}
              {row.original.inviteId && <span>-</span>}
              {row.original.role === WorkspaceMemberRole.Owner && (
                <span className=" text-zinc-400">(Owner)</span>
              )}
            </div>
          )
        },
      },
      {
        header: 'Email',
        accessorKey: 'email',
        size: 2,
        cell: ({ row }) => {
          return (
            <div className="flex items-center gap-x-2">
              <div>{row.original.email}</div>
              {row.original.inviteId && (
                <Badge variant="yellow" size="xs">
                  Invited
                </Badge>
              )}
            </div>
          )
        },
      },
      {
        id: 'remove',
        size: 1,
        cell: ({ row }) => {
          if (row.original.role === WorkspaceMemberRole.Owner) {
            return <></>
          }

          let scenario = 'regular_user'
          if (row.original.id === self?.id) {
            scenario = 'self_user'
          } else if (row.original.inviteId) {
            scenario = 'invited_user'
          }

          return (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <div className="flex justify-end">
                  <Button variant="outline" className="gap-1 whitespace-nowrap">
                    {row.original.inviteId ? 'Cancel invite' : 'Revoke access'}
                  </Button>
                </div>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  {scenario === 'self_user' && (
                    <AlertDialogDescription>
                      <div className="space-y-2">
                        <p>
                          You are going to revoke{' '}
                          <span className="font-bold">your own access</span> to
                          this workspace.
                        </p>
                        <p>
                          You won&apos;t be able to access this workspace unless
                          an admin invites you again.
                        </p>
                      </div>
                    </AlertDialogDescription>
                  )}
                  {scenario === 'regular_user' && (
                    <AlertDialogDescription>
                      <div className="space-y-2">
                        <p>
                          You are going to revoke access to this workspace to{' '}
                          <span className="font-bold">
                            {row.original.name} ({row.original.email})
                          </span>
                          .
                        </p>
                        <p>
                          The user won&apos;t be able to access this workspace
                          unless invited again.
                        </p>
                      </div>
                    </AlertDialogDescription>
                  )}
                  {scenario === 'invited_user' && (
                    <AlertDialogDescription>
                      <div className="space-y-2">
                        <p>
                          You are going to cancel the invite for{' '}
                          <div className="font-bold">{row.original.email}</div>
                        </p>
                      </div>
                    </AlertDialogDescription>
                  )}
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => {
                      if (scenario === 'invited_user') {
                        handleCancelInvite(row.original.inviteId!)
                      } else {
                        handleRevokeAccess(row.original.id!)
                      }
                    }}
                  >
                    {scenario === 'invited_user' ? 'Cancel invite' : 'Revoke'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )
        },
      },
    ],
    [self, handleRevokeAccess, handleCancelInvite],
  )

  return <DataTable columns={columns} data={workspaceMembers} />
}
