import { SelectAiModelsFormField } from '@/components/ai/components/SelectAiModelsFormField'
import { useAppAssets, useAppById } from '@/components/apps/appsHooks'
import { StyledLink } from '@/components/ui/StyledLink'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckboxField } from '@/components/ui/forms/CheckboxField'
import { TextAreaField } from '@/components/ui/forms/TextAreaField'
import { useIsAdmin } from '@/components/users/usersHooks'
import { useWorkspaceProperties } from '@/components/workspaces/workspacesHooks'
import { stringRequired } from '@/lib/frontend/finalFormValidations'
import { useNavigation } from '@/lib/frontend/useNavigation'
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
  showOpenaiAssistantSelector?: boolean
  isOpenAiAssistantSelected?: boolean
}

export const AppConfigForGPTSettings = ({
  appId,
  disabled = false,
  showOpenaiAssistantSelector = false,
  isOpenAiAssistantSelected = false,
}: AppConfigForGPTSettingsProps) => {
  const navigation = useNavigation()
  const { data: app } = useAppById(appId)

  const { data: appAssets } = useAppAssets(appId)

  const hasFiles = appAssets && appAssets.length > 0

  const ref = useRef<HTMLTextAreaElement>(null)
  const focusQueryStringEl = navigation.query?.focus
  useEffect(() => {
    if (ref.current && focusQueryStringEl === 'systemMessage' && !disabled) {
      ref.current.focus()
    }
  }, [focusQueryStringEl, disabled])

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
          <AppConfigForGPTFileUpload appId={appId} />
        </div>
      )}

      <div className="space-y-4">
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
                  disabled={disabled}
                />
              )
            }}
          />
        </div>
        {showOpenaiAssistantSelector && hasFiles && (
          <div className="">
            <Field
              name="isOpenaiAssistant"
              render={({ input }) => {
                const handleCheckToggle = (checked: boolean) => {
                  input.onChange(checked)
                }

                return (
                  <CheckboxField
                    {...input}
                    onCheckedChange={handleCheckToggle}
                    checked={!!input.value}
                    label="Use OpenAI's native engine to read and answer questions from files"
                  />
                )
              }}
            />
          </div>
        )}
        <div>
          {app && !isOpenAiAssistantSelected && (
            <HuggingFaceApiKeyAlert
              selectedModelIsOpenAi={showOpenaiAssistantSelector}
              workspaceId={app.workspaceId}
            />
          )}
        </div>
      </div>
    </>
  )
}

const HuggingFaceApiKeyAlert = ({
  selectedModelIsOpenAi,
  workspaceId,
}: {
  selectedModelIsOpenAi: boolean
  workspaceId: string
}) => {
  const { data: workspaceProperties } = useWorkspaceProperties(workspaceId)
  const { isAdmin } = useIsAdmin()
  const navigation = useNavigation()

  let bodyText: React.ReactNode

  if (!workspaceProperties || workspaceProperties.hasHuggingFaceApiKey) {
    return null
  }

  if (selectedModelIsOpenAi) {
    if (isAdmin) {
      bodyText = (
        <>
          You need a Hugging Face API key if you do not use OpenAI&apos;s
          processing engine.{' '}
          <StyledLink
            href={navigation.buildPath('/w/:workspaceId/settings/:tab', {
              workspaceId,
              tab: 'models',
            })}
          >
            Add the API key here.
          </StyledLink>
        </>
      )
    } else {
      bodyText = (
        <>
          You need a Hugging Face API key if you do not use OpenAI&apos;s
          processing engine. Ask the workspace admin to add one for you.
        </>
      )
    }
  } else {
    if (isAdmin) {
      bodyText = (
        <>
          You need a Hugging Face API key to use this model.{' '}
          <StyledLink
            href={navigation.buildPath('/w/:workspaceId/settings/:tab', {
              workspaceId,
              tab: 'models',
            })}
          >
            Add the API key here.
          </StyledLink>
        </>
      )
    } else {
      bodyText = (
        <>
          You need a Hugging Face API key to use this model. Ask the workspace
          admin to add one for you.
        </>
      )
    }
  }

  return (
    <Alert variant="fuchsia" className="lg:max-w-[660px]">
      <AlertDescription className="space-y-2">{bodyText}</AlertDescription>
    </Alert>
  )
}
