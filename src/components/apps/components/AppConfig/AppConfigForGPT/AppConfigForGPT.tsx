import { AppEngineType } from '@/components/apps/appsTypes'
import { useErrorHandler } from '@/components/global/errorHandlingHooks'
import { useCanPerformActionForApp } from '@/components/permissions/permissionsHooks'
import { Skeleton } from '@/components/ui/skeleton'
import { useSuccessToast } from '@/components/ui/toastHooks'
import { getEnumByValue } from '@/lib/utils'
import { getAppEngineFriendlyName } from '@/server/apps/appUtils'
import type { OpenAiModelEnum } from '@/shared/aiTypesAndMappers'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { Form as FinalForm } from 'react-final-form'
import {
  useAppById,
  useAppConfigUpdate,
  useLatestAppConfigVersionForApp,
  useUpdateApp,
} from '../../../appsHooks'
import { AppConfigSubmitButtonGroup } from '../AppConfigSubmitButtonGroup'
import { AppConfigForGPTNameAndDescription } from './AppConfigForGPTNameAndDescription'
import { AppConfigForGPTSettings } from './AppConfigForGPTSettings'

interface AppConfigProps {
  appId?: string
}

interface SubmitProps {
  emoji: string
  title: string
  systemMessage?: string
  description?: string
  model: OpenAiModelEnum
  isOpenaiAssistant?: boolean
  redirect?: boolean
}

export function AppConfigForGPT({ appId }: AppConfigProps) {
  const { data: app } = useAppById(appId)
  const { data: appConfig } = useLatestAppConfigVersionForApp(appId)

  const { mutateAsync: updateAppConfigVersion } = useAppConfigUpdate()
  const { mutateAsync: updateApp } = useUpdateApp()
  const toast = useSuccessToast()
  const errorHandler = useErrorHandler()
  const { data: canEdit } = useCanPerformActionForApp(
    PermissionAction.Update,
    appId,
  )

  const appEngine = app && getEnumByValue(AppEngineType, app.engineType)

  const handleSubmit = async (values: SubmitProps) => {
    if (!appConfig || !app) {
      return
    }

    const {
      emoji,
      title,
      systemMessage,
      description,
      model,
      isOpenaiAssistant,
    } = values

    const setAppEngineTypeToAssistant = !!(
      model.startsWith('openai') && isOpenaiAssistant
    )

    try {
      await Promise.all([
        updateApp({
          id: app?.id,
          emoji: emoji ?? null,
          title: title ?? null,
          engineType: setAppEngineTypeToAssistant
            ? AppEngineType.Assistant
            : AppEngineType.Default,
        }),
        updateAppConfigVersion({
          id: appConfig?.id,
          systemMessage,
          description: description ?? null,
          model,
        }),
      ])
    } catch (error) {
      errorHandler()(error)
    }

    toast('Success', 'Your changes have been saved.')
  }

  return (
    <div>
      <div className="mb-12 flex justify-end text-sm text-zinc-400">
        {appEngine ? (
          <span>
            <span className="font-semibold ">App type: </span>
            <span className="">{getAppEngineFriendlyName(appEngine)}</span>
          </span>
        ) : (
          <Skeleton className="mt-1 h-3 w-28" />
        )}
      </div>
      <FinalForm
        onSubmit={handleSubmit}
        initialValues={{
          title: app?.title,
          emoji: app?.emoji,
          systemMessage: appConfig?.systemMessage,
          description: appConfig?.description,
          model: appConfig?.model,
        }}
        render={({
          handleSubmit,
          pristine,
          submitting,
          submitFailed,
          hasValidationErrors,
          values,
        }) => {
          const shouldDisplayGlobalError = submitFailed && hasValidationErrors

          const { model } = values

          const handleSave = async () => {
            await handleSubmit()
          }

          return (
            <div className="space-y-8">
              <AppConfigForGPTNameAndDescription disabled={!canEdit} />
              <AppConfigForGPTSettings
                appId={appId}
                disabled={!canEdit}
                showOpenaiAssistantSelector={model?.startsWith('openai')}
              />
              <AppConfigSubmitButtonGroup
                appId={appId}
                pristine={pristine}
                submitting={submitting}
                onSave={handleSave}
                showSubmitError={shouldDisplayGlobalError}
              />
            </div>
          )
        }}
      />
    </div>
  )
}
