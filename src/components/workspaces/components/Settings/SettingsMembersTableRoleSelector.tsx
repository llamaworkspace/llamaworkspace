import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSuccessToast } from '@/components/ui/toastHooks'
import { UserRole } from '@/shared/globalTypes'
import { useState } from 'react'
import { type z } from 'zod'
import { type zodWorkspaceMemberOutput } from '../../backend/workspacesBackendUtils'
import {
  useCurrentWorkspace,
  useUpdateUserRoleForWorkspace,
} from '../../workspacesHooks'

type WorkspaceMember = z.infer<typeof zodWorkspaceMemberOutput>

interface RoleSelectorProps {
  isOwner: boolean
  value: string
  userId?: string
}

export const SettingsMembersTableRoleSelector = ({
  userId,
  isOwner,
  value,
}: RoleSelectorProps) => {
  const { data: workspace } = useCurrentWorkspace()
  const successToast = useSuccessToast()
  const { mutateAsync: updateUserRoleForWorkspace } =
    useUpdateUserRoleForWorkspace()

  // !userId: When a user is invited it has an inviteId (not yet a userId)
  const isDisabled = !userId || isOwner

  const [finalValue, setFinalValue] = useState(
    value || UserRole.Member.toString(),
  )
  const handleValueChange = (nextValue: UserRole) => {
    async function run() {
      if (!workspace) return
      if (!userId) return
      setFinalValue(nextValue)

      await updateUserRoleForWorkspace({
        userId,
        workspaceId: workspace.id,
        role: nextValue,
      })

      successToast(undefined, 'Role updated')
    }
    void run()
  }

  return (
    <Select
      value={finalValue}
      onValueChange={handleValueChange}
      disabled={isDisabled}
    >
      <SelectTrigger className="w-[130px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UserRole.Admin}>Admin</SelectItem>
        <SelectItem value={UserRole.Member}>Member</SelectItem>
      </SelectContent>
    </Select>
  )
}
