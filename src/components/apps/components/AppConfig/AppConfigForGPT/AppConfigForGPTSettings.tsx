import { SelectAiModelsFormField } from '@/components/ai/components/SelectAiModelsFormField'
import { useAppById } from '@/components/apps/appsHooks'
import { AppEngineType } from '@/components/apps/appsTypes'
import { StyledLink } from '@/components/ui/StyledLink'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { TextAreaField } from '@/components/ui/forms/TextAreaField'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { stringRequired } from '@/lib/frontend/finalFormValidations'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { OPENAI_SUPPORTED_FILE_TYPES } from '@/server/apps/appConstants'
import { useEffect, useRef } from 'react'
import { Field } from 'react-final-form'
import { AppConfigForGPTFileUpload } from './AppConfigForGPTFileUpload/AppConfigForGPTFileUpload'

const placeholderMessage = `Write a message to help the AI understand what you are trying to achieve. The more details and context you provide, the better will be ChatGPT's outcome.

For example:
Act as a public speaker and write compelling speeches that can be used to inspire people to take action.
`

interface AppConfigForGPTSettingsProps {
  appId?: string
  disabled?: boolean
}

export const AppConfigForGPTSettings = ({
  appId,
  disabled = false,
}: AppConfigForGPTSettingsProps) => {
  const navigation = useNavigation()
  const { data: workspace } = useCurrentWorkspace()
  const { data: app } = useAppById(appId)
  const ref = useRef<HTMLTextAreaElement>(null)
  const focusQueryStringEl = navigation.query?.focus
  useEffect(() => {
    if (ref.current && focusQueryStringEl === 'systemMessage' && !disabled) {
      ref.current.focus()
    }
  }, [focusQueryStringEl, disabled])

  const isAssistantEngineType = app?.engineType === AppEngineType.Assistant

  const supportedFileTypes = OPENAI_SUPPORTED_FILE_TYPES

  const profileUrl = `/w/${workspace?.id}/profile`

  const modelHelperText = (
    <>
      Update the default model{' '}
      <StyledLink href={profileUrl}>in your profile</StyledLink>.
    </>
  )
  return (
    <>
      <Field
        name="systemMessage"
        validate={stringRequired}
        render={({ input, meta }) => {
          return (
            <>
              <TextAreaField
                ref={ref}
                meta={meta}
                label="Instructions for the AI"
                helperText='This content is known as the "system prompt". Use it to tell the AI what should do and how to behave. The more precise the instructions are, the better the AI will perform.'
                rows={12}
                placeholder={placeholderMessage}
                disabled={disabled}
                {...input}
              />
            </>
          )
        }}
      />

      {app && (
        <div>
          <AppConfigForGPTFileUpload
            appId={appId}
            supportedFileTypes={supportedFileTypes}
          />
        </div>
      )}

      <div>
        <div className="grid md:grid-cols-2">
          <Field
            name="model"
            validate={stringRequired}
            render={({ input }) => {
              return (
                <SelectAiModelsFormField
                  {...input}
                  placeholder="Select a model"
                  label="AI model"
                  helperText={modelHelperText}
                  disabled={disabled || isAssistantEngineType}
                />
              )
            }}
          />
        </div>
        <div className="pt-4">
          <Alert variant="default" className="lg:max-w-[600px]">
            <AlertTitle>Limited AI model selection</AlertTitle>
            <AlertDescription className="space-y-2">
              Currently, adding knowledge files is only supported with GPT-4o.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </>
  )
}
