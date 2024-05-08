import { useErrorHandler } from '@/components/global/errorHandlingHooks'
import { useCanExecuteActionForPost } from '@/components/permissions/permissionsHooks'
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
  useLatestPostConfigVersionForPost,
  usePostById,
  usePostConfigUpdate,
  useUpdatePost,
} from '../../../postsHooks'
import { PostConfigSubmitButtonGroup } from '../PostConfigSubmitButtonGroup'
import { PostConfigForGPTNameAndDescription } from './PostConfigForGPTNameAndDescription'
import { PostConfigForGPTSettings } from './PostConfigForGPTSettings'

interface PostConfigProps {
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

export function PostConfigForGPT({ postId }: PostConfigProps) {
  const router = useRouter()
  const returnToChatRoute = router.asPath.replace(`/configuration`, '')
  const { data: post } = usePostById(postId)
  const { data: postConfig } = useLatestPostConfigVersionForPost(postId)

  const { mutateAsync: updatePostConfigVersion } = usePostConfigUpdate()
  const { mutateAsync: updatePost } = useUpdatePost()
  const toast = useSuccessToast()
  const errorHandler = useErrorHandler()
  const { can: canEdit } = useCanExecuteActionForPost(
    PermissionAction.Update,
    postId,
  )

  const hideBackButton = router.query?.backButton === 'false'

  const handleSubmit = async (values: SubmitProps) => {
    const { emoji, title, systemMessage, description, model } = values
    if (!postConfig || !post) {
      return
    }

    try {
      await Promise.all([
        updatePost({
          id: post?.id,
          emoji: emoji ?? null,
          title: title ?? null,
        }),
        updatePostConfigVersion({
          id: postConfig?.id,
          systemMessage: systemMessage ?? null,
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
              systemMessage: postConfig?.systemMessage,
              description: postConfig?.description,
              model: postConfig?.model,
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
                  <PostConfigForGPTNameAndDescription disabled={!canEdit} />
                  <PostConfigForGPTSettings disabled={!canEdit} />
                  <PostConfigSubmitButtonGroup
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
