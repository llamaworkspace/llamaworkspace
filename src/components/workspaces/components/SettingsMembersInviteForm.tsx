import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useSuccessToast } from '@/components/ui/toastHooks'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { validateFormWithZod } from '@/lib/frontend/finalFormValidations'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { InformationCircleIcon } from '@heroicons/react/24/solid'
import { FORM_ERROR, type Config } from 'final-form'
import { useCallback, useEffect, useRef } from 'react'
import { Field, Form as FinalForm } from 'react-final-form'
import { z } from 'zod'
import { useInviteUserToWorkspace } from '../workspaceMembersHooks'
import { useCurrentWorkspace } from '../workspacesHooks'

const zodInviteUserFormValues = z.object({
  email: z.string().email(),
})
type InviteUserFormValues = z.infer<typeof zodInviteUserFormValues>

export const SettingsMembersInviteForm = () => {
  const { workspace } = useCurrentWorkspace()
  const navigation = useNavigation()
  const { mutateAsync: inviteUser } = useInviteUserToWorkspace()
  const toast = useSuccessToast()
  const inputRef = useRef<HTMLInputElement>(null)

  const focusQueryStringEl = navigation.query?.focus

  useEffect(() => {
    if (inputRef.current && focusQueryStringEl === 'add_members') {
      inputRef.current.focus()
    }
  }, [focusQueryStringEl])

  const handleFormSubmit = useCallback<
    Config<InviteUserFormValues>['onSubmit']
  >(
    (values, form) => {
      if (!workspace) return

      return inviteUser(
        { workspaceId: workspace.id, email: values.email },
        {
          onSuccess: () => {
            toast(
              'User invited',
              'We have sent an invitation to the designated email address.',
            )
            form.reset()
          },
        },
      ).catch(() => {
        return { [FORM_ERROR]: 'Submission failed' }
      })
    },
    [workspace, inviteUser, toast],
  )

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <Tooltip delayDuration={100}>
        <TooltipTrigger asChild>
          <InformationCircleIcon className="h-5 w-5 text-zinc-600" />
        </TooltipTrigger>
        <TooltipContent className="max-w-[300px]">
          <p>
            Inviting members grants them full control over the workspace, which
            includes configuring chatbots, setting up OpenAI accounts, and
            inviting additional members.
          </p>
        </TooltipContent>
      </Tooltip>
      <FinalForm<InviteUserFormValues>
        onSubmit={handleFormSubmit}
        validate={validateFormWithZod(zodInviteUserFormValues)}
        render={({ handleSubmit, submitting, hasValidationErrors }) => {
          return (
            <form onSubmit={(ev) => void handleSubmit(ev)}>
              <div className="flex flex-row">
                <Field<string>
                  name="email"
                  render={({ input }) => {
                    return (
                      <Input
                        ref={inputRef}
                        type="email"
                        placeholder="Add people by typing their email"
                        data-lpignore="true"
                        autoComplete="off"
                        disabled={submitting}
                        className="w-64"
                        {...input}
                      />
                    )
                  }}
                />
                <Button
                  type="submit"
                  variant="primary"
                  className="ml-2 whitespace-nowrap"
                  disabled={hasValidationErrors || submitting}
                >
                  Invite member
                </Button>
              </div>
            </form>
          )
        }}
      />
    </div>
  )
}
