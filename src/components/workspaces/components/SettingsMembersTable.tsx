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
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { useSelf } from '@/components/users/usersHooks'
import { UserMinusIcon } from '@heroicons/react/24/solid'
import type { ColumnDef } from '@tanstack/react-table'
import { useCallback, useMemo } from 'react'
import { type z } from 'zod'
import {
  WorkspaceMemberRole,
  type zodWorkspaceMemberOutput,
} from '../backend/workspacesBackendUtils'
import {
  useRevokeWorkspaceMemberAccess,
  useWorkspaceMembers,
} from '../workspaceMembersHooks'
import { useCurrentWorkspace } from '../workspacesHooks'

type WorkspaceMember = z.infer<typeof zodWorkspaceMemberOutput>

export const SettingsMembersTable = () => {
  const { workspace } = useCurrentWorkspace()
  const { workspaceMembers } = useWorkspaceMembers(workspace?.id)
  const { data: self } = useSelf()
  const { mutate } = useRevokeWorkspaceMemberAccess()

  const handleRevokeAccess = useCallback(
    (userId: string) => {
      if (!workspace) return

      mutate({ workspaceId: workspace.id, userId })
    },
    [workspace, mutate],
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
      },
      {
        id: 'remove',
        size: 1,
        cell: ({ row }) => {
          if (row.original.role === WorkspaceMemberRole.Owner) {
            return <></>
          }

          return (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="gap-1 whitespace-nowrap">
                  <UserMinusIcon className="h-4 w-4" />
                  Revoke access
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  {row.original.id === self?.id ? (
                    <AlertDialogDescription>
                      <p>
                        You are going to revoke{' '}
                        <span className="font-bold">your access</span> to this
                        workspace.
                      </p>
                      <p>
                        You won&apos;t be able to access this workspace unless
                        invited again.
                      </p>
                    </AlertDialogDescription>
                  ) : (
                    <AlertDialogDescription>
                      You are going to revoke access to this workspace to
                      <div className="font-bold">
                        {row.original.name} ({row.original.email})
                      </div>
                      The user won&apos;t be able to access this workspace
                      unless invited again.
                    </AlertDialogDescription>
                  )}
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleRevokeAccess(row.original.id)}
                  >
                    Revoke access
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )
        },
      },
    ],
    [self, handleRevokeAccess],
  )

  return <DataTable columns={columns} data={workspaceMembers} />
}
