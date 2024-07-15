import { AppEngineType } from '@/components/apps/appsTypes'
import { useErrorHandler } from '@/components/global/errorHandlingHooks'
import { useCanPerformActionForApp } from '@/components/permissions/permissionsHooks'
import { Skeleton } from '@/components/ui/skeleton'
import { useSuccessToast } from '@/components/ui/toastHooks'
import { getEnumByValue } from '@/lib/utils'
import { getAppEngineFriendlyName } from '@/server/apps/appUtils'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import { Form as FinalForm } from 'react-final-form'
import {
  useAppById,
  useAppConfigUpdate,
  useLatestAppConfigVersionForApp,
  useUpdateApp,
  useUpdateKeyValues,
} from '../../../appsHooks'
import { AppConfigForGPTNameAndDescription } from '../AppConfigForGPT/AppConfigForGPTNameAndDescription'
import { AppConfigSubmitButtonGroup } from '../AppConfigSubmitButtonGroup'
import { AppConfigForExternalAppSettings } from './AppConfigForExternalAppSettings'

interface AppConfigProps {
  appId?: string
}

interface SubmitProps {
  emoji: string
  title: string
  description?: string
  targetUrl: string
  accessKey: string
}

export function AppConfigForExternalApp({ appId }: AppConfigProps) {
  const { data: app } = useAppById(appId)
  const { data: appConfig } = useLatestAppConfigVersionForApp(appId)

  const { mutateAsync: updateAppConfigVersion } = useAppConfigUpdate()
  const { mutateAsync: updateKeyValues } = useUpdateKeyValues()
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

    const { emoji, title, description, accessKey, targetUrl } = values

    try {
      await Promise.all([
        updateApp({
          id: app.id,
          emoji: emoji ?? null,
          title: title ?? null,
        }),
        updateAppConfigVersion({
          id: appConfig.id,
          description: description ?? null,
        }),
        updateKeyValues({
          id: app.id,
          keyValuePairs: {
            accessKey,
            targetUrl,
          },
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
          description: appConfig?.description,
        }}
        render={({
          handleSubmit,
          pristine,
          submitting,
          submitFailed,
          hasValidationErrors,
        }) => {
          const shouldDisplayGlobalError = submitFailed && hasValidationErrors

          const handleSave = async () => {
            await handleSubmit()
          }
          return (
            <div className="space-y-8">
              <AppConfigForGPTNameAndDescription disabled={!canEdit} />
              <AppConfigForExternalAppSettings
                appId={appId}
                disabled={!canEdit}
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
