import { useDeleteApp } from '@/components/apps/appsHooks'
import { DeleteConfirmationDialog } from '@/components/ui/DeleteConfirmationDialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DropdownMenuItemLink } from '@/components/ui/extensions/dropdown-menu'
import { useSuccessToast } from '@/components/ui/toastHooks'
import { cn } from '@/lib/utils'
import {
  DocumentDuplicateIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { EllipsisHorizontalIcon } from '@heroicons/react/24/solid'
import { useState } from 'react'

interface AppEllipsisDropdownProps {
  appId: string
  canDelete: boolean
  onDuplicate: () => void
  canDuplicate: boolean
}

export const AppEllipsisDropdown = ({
  appId,
  canDelete,
  canDuplicate,
  onDuplicate,
}: AppEllipsisDropdownProps) => {
  const { mutateAsync: deleteApp } = useDeleteApp()
  const successToast = useSuccessToast()
  const [displayAppDeleteConfirmation, setDisplayAppDeleteConfirmation] =
    useState<boolean>(false)

  const handleAppDelete = () => {
    async function _doAppDeletion() {
      await deleteApp(
        { id: appId },
        {
          onSuccess: () => {
            successToast(undefined, 'App successfully deleted')
          },
        },
      )
      setDisplayAppDeleteConfirmation(false)
    }
    void _doAppDeletion()
  }

  return (
    <>
      <DeleteConfirmationDialog
        title="Delete app"
        description="Are you sure you want to delete this app? This action cannot be
              undone."
        isOpen={displayAppDeleteConfirmation}
        onCancel={() => setDisplayAppDeleteConfirmation(false)}
        onConfirm={handleAppDelete}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            onClick={(ev) => {
              ev.stopPropagation()
            }}
            className="flex h-8 w-8 transform items-center justify-center rounded duration-100 hover:bg-zinc-200 "
          >
            <EllipsisHorizontalIcon className="h-6 w-6" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItemLink
            onClick={(ev) => {
              ev.stopPropagation()
            }}
            href={`/p/${appId}/configuration?backButton=false`}
          >
            <PencilIcon className="mr-2 h-4 w-4" />
            <span>Edit</span>
          </DropdownMenuItemLink>
          <DropdownMenuItem
            onClick={(ev) => {
              ev.stopPropagation() // otherwise it will navigate away from the page
              canDuplicate && onDuplicate()
            }}
            className={cn(!canDuplicate && 'cursor-not-allowed opacity-50')}
          >
            <DocumentDuplicateIcon className="mr-2 h-4 w-4" />
            <span>Duplicate</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={(ev) => {
              canDelete && setDisplayAppDeleteConfirmation(true)
              ev.stopPropagation()
              ev.preventDefault()
            }}
            className={cn(!canDelete && 'cursor-not-allowed opacity-50')}
          >
            <TrashIcon className="mr-2 h-4 w-4" />
            <span>Delete</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  )
}
