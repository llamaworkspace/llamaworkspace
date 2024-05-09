import { usePostSharePerform } from '@/components/posts/postsHooks'
import type { ComponentWithPostId } from '@/components/posts/postsTypes'
import { Button } from '@/components/ui/button'
import { SelectField } from '@/components/ui/forms/SelectField'
import { Input } from '@/components/ui/input'
import {
  composeValidators,
  email,
  stringOrNumberRequired,
} from '@/lib/frontend/finalFormValidations'
import { cn } from '@/lib/utils'
import type { UserAccessLevelActions } from '@/shared/globalTypes'
import type { FormApi } from 'final-form'
import { Field, Form as FinalForm, type FieldMetaState } from 'react-final-form'
import { useSuccessToast } from '../../../ui/toastHooks'
import { ChatHeaderShareAccessLevelPopover } from './ChatHeaderShareAccessLevelPopover'
import { ChatHeaderShareWhoCanAccess } from './ChatHeaderShareWhoCanAccess'

interface FormShape {
  email: string
}

const generalAccessOptions = [
  { value: 'restricted', label: 'Specific users' },
  { value: 'general', label: 'Everyone in the Workspace' },
]

export const ChatHeaderShareBody = ({ postId }: ComponentWithPostId) => {
  const toast = useSuccessToast()

  // const { data: share } = usePostShare(postId)
  const { mutate: performShare } = usePostSharePerform()

  const handleSubmit = ({ email }: FormShape, form: FormApi<FormShape>) => {
    performShare(
      { email, postId },
      {
        onSuccess: () => {
          toast('User added', `We've notified ${email} about your invite`)
          form.reset()
        },
      },
    )
  }

  return (
    <div>
      <ChatHeaderShareWhoCanAccess postId={postId} />
      <FinalForm
        onSubmit={handleSubmit}
        render={({ handleSubmit, values, submitting }) => {
          const isSubmitDisabled = !values.email || submitting

          const handleKeyDown = (event: React.KeyboardEvent) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              void handleSubmit()
            }
          }

          return (
            <div className="space-y-8 text-sm">
              <Field
                name="title"
                render={({ input, meta }) => {
                  return (
                    <SelectField
                      options={generalAccessOptions}
                      meta={meta}
                      label="Who can access"
                      onChangeCapture={handleSubmit}
                      {...input}
                    />
                  )
                }}
              />
            </div>
          )
        }}
      />
    </div>
  )

  return (
    <FinalForm
      onSubmit={handleSubmit}
      render={({ handleSubmit, values, submitting }) => {
        const isSubmitDisabled = !values.email || submitting

        const handleKeyDown = (event: React.KeyboardEvent) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            void handleSubmit()
          }
        }
        return (
          <div className="space-y-8 text-sm">
            <div className="space-y-1">
              <div className="font-semibold tracking-tight">Invite</div>
              <Field
                name="email"
                validate={composeValidators(stringOrNumberRequired, email)}
                render={({ input, meta }) => {
                  meta = meta as FieldMetaState<string>

                  return (
                    <>
                      <div className="flex w-full items-center">
                        <Input
                          type="email"
                          placeholder="Add people by typing their email"
                          data-lpignore="true"
                          autoComplete="off"
                          onKeyDown={handleKeyDown}
                          {...input}
                        />
                        <Button
                          type="submit"
                          className="ml-2"
                          size="sm"
                          onClick={(...args) => void handleSubmit(...args)}
                          disabled={isSubmitDisabled}
                          variant="secondary"
                        >
                          Invite
                        </Button>
                      </div>

                      {meta.error && meta.submitFailed && (
                        <div className="mt-1 text-xs text-red-600">
                          {meta.error}
                        </div>
                      )}
                    </>
                  )
                }}
              />
            </div>
            <div>
              <div className="font-semibold tracking-tight">
                People with access
              </div>
              {!share?.length && (
                <div className="mt-2 text-sm text-zinc-500">
                  No one else has access
                </div>
              )}
              {share?.map((share, index) => {
                const isUser = !!share.userId

                return (
                  <div
                    key={share.id}
                    className={cn(
                      'flex items-center justify-between py-3',
                      index + 1 !== share.length && 'border-b',
                    )}
                  >
                    <div className="flex items-center gap-x-2">
                      <div
                        className={isUser ? 'text-zinc-700' : 'text-zinc-400'}
                      >
                        {share.email}
                      </div>
                      {!isUser && (
                        <div>
                          <span className="rounded bg-yellow-100 px-1 py-0.5 text-[0.6rem] uppercase text-yellow-600">
                            Invited
                          </span>
                        </div>
                      )}
                    </div>
                    <ChatHeaderShareAccessLevelPopover
                      postId={postId}
                      shareId={share.id}
                      activeAccessLevel={
                        share.accessLevel as UserAccessLevelActions
                      }
                    />
                  </div>
                )
              })}
            </div>
            <div>
              <div className="font-semibold tracking-tight">General access</div>
              <div className={cn('flex items-center justify-between py-3')}>
                <div className="flex items-center gap-x-2">
                  <div className="text-zinc-700">Restricted</div>
                </div>
              </div>
            </div>
          </div>
        )
      }}
    />
  )
}
