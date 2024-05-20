import { useErrorHandler } from '@/components/global/errorHandlingHooks'
import { useCanPerformActionForPost } from '@/components/permissions/permissionsHooks'
import {
  Section,
  SectionBody,
  SectionsHeader,
  SectionsShell,
} from '@/components/ui/Section'
import { Button } from '@/components/ui/button'
import { useSuccessToast } from '@/components/ui/toastHooks'
import type { OpenAiModelEnum } from '@/shared/aiTypesAndMappers'
import { PermissionAction } from '@/shared/permissions/permissionDefinitions'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Form as FinalForm } from 'react-final-form'
import {
  useAppConfigUpdate,
  useLatestAppConfigVersionForPost,
  usePostById,
  useUpdatePost,
} from '../../../postsHooks'
import { AppConfigSubmitButtonGroup } from '../AppConfigSubmitButtonGroup'
import { AppConfigForGPTNameAndDescription } from './AppConfigForGPTNameAndDescription'
import { AppConfigForGPTSettings } from './AppConfigForGPTSettings'

interface AppConfigProps {
  postId?: string
}

interface SubmitProps {
  emoji: string
  title: string
  systemMessage?: string
  description?: string
  model: OpenAiModelEnum
  redirect?: boolean
}

export function AppConfigForGPT({ postId }: AppConfigProps) {
  const router = useRouter()
  const returnToChatRoute = router.asPath.replace(`/configuration`, '')
  const { data: post } = usePostById(postId)
  const { data: appConfig } = useLatestAppConfigVersionForPost(postId)

  const { mutateAsync: updateAppConfigVersion } = useAppConfigUpdate()
  const { mutateAsync: updatePost } = useUpdatePost()
  const toast = useSuccessToast()
  const errorHandler = useErrorHandler()
  const { data: canEdit } = useCanPerformActionForPost(
    PermissionAction.Update,
    postId,
  )

  const hideBackButton = router.query?.backButton === 'false'

  const handleSubmit = async (values: SubmitProps) => {
    const { emoji, title, systemMessage, description, model } = values
    if (!appConfig || !post) {
      return
    }

    try {
      await Promise.all([
        updatePost({
          id: post?.id,
          emoji: emoji ?? null,
          title: title ?? null,
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
    <SectionsShell>
      {!hideBackButton && (
        <div className="mb-8">
          <Link href={returnToChatRoute}>
            <Button variant="outline">&larr; Back to chat</Button>
          </Link>
        </div>
      )}
      <SectionsHeader>GPT configuration</SectionsHeader>
      <Section>
        <SectionBody>
          <FinalForm
            onSubmit={handleSubmit}
            initialValues={{
              title: post?.title,
              emoji: post?.emoji,
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
            }) => {
              const shouldDisplayGlobalError =
                submitFailed && hasValidationErrors

              const handleSave = async () => {
                await handleSubmit()
              }
              return (
                <div className="space-y-8">
                  <AppConfigForGPTNameAndDescription disabled={!canEdit} />
                  <AppConfigForGPTSettings disabled={!canEdit} />
                  <AppConfigSubmitButtonGroup
                    postId={postId}
                    pristine={pristine}
                    submitting={submitting}
                    onSave={handleSave}
                    showSubmitError={shouldDisplayGlobalError}
                  />
                </div>
              )
            }}
          />
        </SectionBody>
      </Section>
    </SectionsShell>
  )
}
