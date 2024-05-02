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
import { PostConfigSubmitButtonGroup } from '../../PostConfigSubmitButtonGroup'
import { PostConfigForGPTSettings } from './PostConfigForGPTSettings'
import { PostConfigForGPTSystemPrompt } from './PostConfigForGPTSystemPrompt'

interface PostConfigProps {
  postId?: string
}

interface SubmitProps {
  system_message?: string
  initial_message?: string
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
    const { system_message, initial_message, model } = values
    if (!postConfig) {
      return Promise.resolve()
    }

    return new Promise((resolve, reject) => {
      updatePostConfigVersion(
        {
          id: postConfig?.id,
          systemMessage: system_message ?? null,
          initialMessage: initial_message ?? null,
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
      <Section>
        <SectionBody>
          {!hideBackButton && (
            <SectionsHeader>
              <Link href={returnToChatRoute}>
                <Button variant="outline">&larr; Back to chat</Button>
              </Link>
            </SectionsHeader>
          )}
          <FinalForm
            onSubmit={handleSubmit}
            initialValues={{
              system_message: postConfig?.systemMessage,
              initial_message: postConfig?.initialMessage,
              model: postConfig?.model,
            }}
            render={({ handleSubmit, pristine, submitting }) => {
              const handleSubmitAndRedirect = () => {
                async function run() {
                  await handleSubmit()
                  if (router.query.chat_id) {
                    return void router.push(returnToChatRoute)
                  }
                  if (!postId) return
                  await createChat({ postId })
                }
                void run()
              }
              return (
                <>
                  <PostConfigForGPTSystemPrompt disabled={!canEdit} />
                  <SectionDivider />
                  <PostConfigForGPTSettings disabled={!canEdit} />
                  <PostConfigSubmitButtonGroup
                    pristine={pristine}
                    submitting={submitting}
                    handleSubmit={() => void handleSubmit()}
                    handleSubmitAndRedirect={handleSubmitAndRedirect}
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
