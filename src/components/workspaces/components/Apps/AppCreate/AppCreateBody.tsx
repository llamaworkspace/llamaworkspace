import { useCreateApp } from '@/components/apps/appsHooks'
import { AppEngineType } from '@/components/apps/appsTypes'
import { Button } from '@/components/ui/button'
import { BoxedRadioGroupField } from '@/components/ui/forms/BoxedRadioGroupField'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { stringRequired } from '@/lib/frontend/finalFormValidations'
import { getEnumByValue } from '@/lib/utils'
import { Field, Form as FinalForm } from 'react-final-form'

const options = [
  // {
  //   value: 'default',
  //   title: 'Simple assistant',
  //   description:
  //     'An instructions-based assistant for repeatable use cases. Compatible with any Large Language model.',
  // },
  {
    value: 'assistant',
    title: 'Document-enhanced assistant',
    description:
      'A document-augmented assistant that queries provided documents to deliver contextually relevant responses. Currently it is only compatible with OpenAI.',
  },
  // {
  //   value: 'external',
  //   title: 'Your own external assistant',
  //   description:
  //     'Build your own assistant with custom logic and integrate it here for easy access.',
  // },
]

interface FormValues {
  appType: string
}

export const AppCreateBody = () => {
  const { data: workspace } = useCurrentWorkspace()
  const { mutateAsync: createApp } = useCreateApp()

  const handleCreateApp = async ({ appType }: FormValues) => {
    if (!workspace?.id) return
    const appTypeAsEnum = getEnumByValue(AppEngineType, appType)
    await createApp({ workspaceId: workspace.id, engineType: appTypeAsEnum })
  }

  return (
    <FinalForm<FormValues>
      onSubmit={(values) => {
        void handleCreateApp(values)
      }}
      render={({ handleSubmit }) => {
        return (
          <div className="space-y-8">
            <Field
              name="appType"
              validate={stringRequired}
              render={({ input, meta }) => {
                return (
                  <BoxedRadioGroupField
                    meta={meta}
                    options={options}
                    {...input}
                  />
                )
              }}
            />

            <Button onClick={() => void handleSubmit()}>Create app</Button>
          </div>
        )
      }}
    />
  )
}
