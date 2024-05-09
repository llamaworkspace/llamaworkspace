import {
  usePostSharePerform,
  usePostShareUpdate,
} from '@/components/posts/postsHooks'
import { SelectField } from '@/components/ui/forms/SelectField'
import { ShareScope } from '@/shared/globalTypes'
import { Field, Form as FinalForm } from 'react-final-form'
import { useSuccessToast } from '../../../ui/toastHooks'

interface FormShape {
  scope: ShareScope
}

const generalAccessOptions = [
  { value: ShareScope.User.toString(), label: 'Specific users' },
  {
    value: ShareScope.Everybody.toString(),
    label: 'Everyone in the Workspace',
  },
]

interface ChatHeaderShareWhoCanAccessProps {
  shareId: string
}

export const ChatHeaderShareWhoCanAccess = ({
  shareId,
}: ChatHeaderShareWhoCanAccessProps) => {
  const toast = useSuccessToast()

  // const { data: shares } = usePostShares(postId)
  const { mutate: performShare } = usePostSharePerform()
  const { mutateAsync: updateShare } = usePostShareUpdate()

  const handleSubmit = async ({ scope }: FormShape) => {
    await updateShare(
      { shareId, scope },
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
