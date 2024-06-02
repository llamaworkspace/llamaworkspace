import { usePostShare, usePostShareUpdate } from '@/components/posts/postsHooks'
import { SelectField } from '@/components/ui/forms/SelectField'
import { ShareScope } from '@/shared/globalTypes'
import { Field, Form as FinalForm } from 'react-final-form'
import { useSuccessToast } from '../../../ui/toastHooks'

interface FormShape {
  scope: ShareScope
}

const generalAccessOptions = [
  { value: ShareScope.Private.toString(), label: 'Only me' },
  {
    value: ShareScope.Everybody.toString(),
    label: 'All workspace members',
  },
  { value: ShareScope.User.toString(), label: 'Specific people' },
]

interface ChatHeaderShareWhoCanAccessProps {
  appId: string
}

export const ChatHeaderShareWhoCanAccess = ({
  appId,
}: ChatHeaderShareWhoCanAccessProps) => {
  const toast = useSuccessToast()
  const { data: share } = usePostShare(appId)

  const { mutateAsync: updateShare } = usePostShareUpdate()

  const handleSubmit = async ({ scope }: FormShape) => {
    if (!share) return
    await updateShare(
      { shareId: share.id, scope },
      {
        onSuccess: () => {
          toast(undefined, `Access level updated`)
        },
      },
    )
  }

  return (
    <FinalForm
      onSubmit={handleSubmit}
      initialValues={{ scope: share?.scope }}
      render={({ handleSubmit }) => {
        return (
          <div className="space-y-8 text-sm">
            <Field
              name="scope"
              render={({ input, meta }) => {
                return (
                  <SelectField
                    options={generalAccessOptions}
                    meta={meta}
                    label="Who can access"
                    onValueChange={() => void handleSubmit()}
                    {...input}
                  />
                )
              }}
            />
          </div>
        )
      }}
    />
  )
}
