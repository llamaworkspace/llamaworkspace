import { useCreateChatForApp } from '@/components/chats/chatHooks'
import { useErrorHandler } from '@/components/global/errorHandlingHooks'
import { useCanExecuteActionForPost } from '@/components/permissions/permissionsHooks'
import {
  Section,
  SectionBody,
  SectionDivider,
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
  usePostConfigUpdate,
} from '../../../postsHooks'
import { PostConfigSubmitButtonGroup } from '../PostConfigSubmitButtonGroup'
import { PostConfigForGPTSettings } from './PostConfigForGPTSettings'
import { PostConfigForGPTSystemPrompt } from './PostConfigForGPTSystemPrompt'
PostConfigSubmitButtonGroup

interface PostConfigProps {
  postId?: string
}

interface SubmitProps {
  systemMessage?: string
  initialMessage?: string
  model: OpenAiModelEnum
  redirect?: boolean
}

export function PostConfigForGPT({ postId }: PostConfigProps) {
  const router = useRouter()
  const returnToChatRoute = router.asPath.replace(`/configuration`, '')
  const { data: postConfig } = useLatestPostConfigVersionForPost(postId)
  const { mutate: updatePostConfigVersion } = usePostConfigUpdate()
  const { mutateAsync: createChat } = useCreateChatForApp()
  const toast = useSuccessToast()
  const errorHandler = useErrorHandler()
  const { can: canEdit } = useCanExecuteActionForPost(
    PermissionAction.Update,
    postId,
  )

  const hideBackButton = router.query?.backButton === 'false'

  const handleSubmit = async (values: SubmitProps) => {
    const { systemMessage, initialMessage, model } = values
    if (!postConfig) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      updatePostConfigVersion(
        {
          id: postConfig?.id,
          systemMessage: systemMessage ?? null,
          initialMessage: initialMessage ?? null,
          model,
        },
        {
          onSuccess: (postConfig) => {
            toast('Success', 'Your changes have been saved.')
            resolve(postConfig)
          },
          onError: (error) => {
            errorHandler()(error)
            reject(error)
          },
        },
      )
    })
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
              systemMessage: postConfig?.systemMessage,
              initialMessage: postConfig?.initialMessage,
              model: postConfig?.model,
            }}
            render={({ handleSubmit, pristine, submitting }) => {
              const handleSave = async () => {
                await handleSubmit()
              }
              return (
                <>
                  <PostConfigForGPTSystemPrompt disabled={!canEdit} />
                  <SectionDivider />
                  <PostConfigForGPTSettings disabled={!canEdit} />
                  <PostConfigSubmitButtonGroup
                    pristine={pristine}
                    submitting={submitting}
                    onSave={handleSave}
                  />
                </>
              )
            }}
          />
        </SectionBody>
      </Section>
    </SectionsShell>
  )
}
