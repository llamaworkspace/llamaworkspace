import { useProviders } from '@/components/providers/providersHooks'
import { Section, SectionBody, SectionHeader } from '@/components/ui/Section'
import { StyledLink } from '@/components/ui/StyledLink'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { InputField } from '@/components/ui/forms/InputField'
import { useSuccessToast } from '@/components/ui/toastHooks'
import { useNavigation } from '@/lib/frontend/useNavigation'
import { useEffect, useRef } from 'react'
import { Field, Form as FinalForm } from 'react-final-form'
import { isEqual } from 'underscore'
import { useCurrentWorkspace, useUpdateWorkspace } from '../workspacesHooks'
type FormValues = {
  openAiApiKey: string | null
}

export const SettingsApiKeys = () => {
  const { mutate: updateWorkspace } = useUpdateWorkspace()
  const successToast = useSuccessToast()
  const navigation = useNavigation()
  const { workspace } = useCurrentWorkspace()
  const { data: providers } = useProviders()
  console.log(providers)
  const inputRef = useRef<HTMLInputElement>(null)

  const focusQueryStringEl = navigation.query?.focus

  useEffect(() => {
    if (inputRef.current && focusQueryStringEl === 'openai_api_key') {
      inputRef.current.focus()
    }
  }, [focusQueryStringEl])

  const initialValues = {
    openAiApiKey: workspace?.openAiApiKey ?? null,
  }

  return (
    <Section>
      <SectionHeader title="AI Services" />
      <SectionBody>
        <div>
          All your interactions will be routed through your AI provider
          accounts, and you will be billed directly by them.
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">
              <div className="flex items-center gap-x-2">
                <div>Open AI </div>
                <Badge variant="yellow" size="xs">
                  Mandatory
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              <FinalForm<FormValues>
                onSubmit={(values) => {
                  if (!workspace?.id) return
                  if (isEqual(values, initialValues)) return

                  const valueChangedIsOpenAiApiKey = !isEqual(
                    values.openAiApiKey,
                    initialValues.openAiApiKey,
                  )

                  // Prevent submitting if the OpenAI key is masked
                  if (
                    valueChangedIsOpenAiApiKey &&
                    values.openAiApiKey?.includes('•')
                  ) {
                    return
                  }

                  // We only send an update for the OpenAI key if
                  // the billingStrategy is ApiKeys and the value is not masked
                  const openAiApiKey = values.openAiApiKey?.includes('•')
                    ? undefined
                    : values.openAiApiKey ?? null

                  updateWorkspace(
                    {
                      workspaceId: workspace.id,
                      openAiApiKey,
                    },
                    {
                      onSuccess: () => {
                        successToast(undefined, 'API keys updated')
                      },
                    },
                  )
                }}
                initialValues={initialValues}
                render={({ handleSubmit }) => {
                  return (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 py-2">
                        <Field
                          name="openAiApiKey"
                          render={({ input }) => {
                            return (
                              <InputField
                                {...input}
                                ref={inputRef}
                                label="OpenAI API key"
                                helperText={
                                  <StyledLink
                                    href="https://joiahq.notion.site/How-to-obtain-an-OpenAI-access-token-f29f71ba136145c9b84a43911c7d8709"
                                    target="_blank"
                                  >
                                    Get help obtaining your OpenAI API key
                                  </StyledLink>
                                }
                                onBlur={() => void handleSubmit()}
                              />
                            )
                          }}
                        />
                      </div>
                    </div>
                  )
                }}
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">Pedro duarte</div>
          </CardContent>
          <CardFooter>
            <button>Save changes</button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="mb-2 text-xl leading-tight">
              Amazon Bedrock
            </CardTitle>
            <CardDescription>
              <FinalForm<FormValues>
                onSubmit={(values) => {
                  if (!workspace?.id) return
                  if (isEqual(values, initialValues)) return

                  const valueChangedIsOpenAiApiKey = !isEqual(
                    values.openAiApiKey,
                    initialValues.openAiApiKey,
                  )

                  // Prevent submitting if the OpenAI key is masked
                  if (
                    valueChangedIsOpenAiApiKey &&
                    values.openAiApiKey?.includes('•')
                  ) {
                    return
                  }

                  // We only send an update for the OpenAI key if
                  // the billingStrategy is ApiKeys and the value is not masked
                  const openAiApiKey = values.openAiApiKey?.includes('•')
                    ? undefined
                    : values.openAiApiKey ?? null

                  updateWorkspace(
                    {
                      workspaceId: workspace.id,
                      openAiApiKey,
                    },
                    {
                      onSuccess: () => {
                        successToast(undefined, 'API keys updated')
                      },
                    },
                  )
                }}
                initialValues={initialValues}
                render={({ handleSubmit }) => {
                  return (
                    <div className="space-y-2">
                      <div className="text-sm text-zinc-600">
                        All the conversations will go through your OpenAI
                        account, and you will be billed directly by them.
                      </div>
                      <div className="grid grid-cols-2 py-2">
                        <Field
                          name="openAiApiKey"
                          render={({ input }) => {
                            return (
                              <InputField
                                {...input}
                                ref={inputRef}
                                label="OpenAI API key"
                                helperText={
                                  <StyledLink
                                    href="https://joiahq.notion.site/How-to-obtain-an-OpenAI-access-token-f29f71ba136145c9b84a43911c7d8709"
                                    target="_blank"
                                  >
                                    Get help obtaining your OpenAI API key
                                  </StyledLink>
                                }
                                onBlur={() => void handleSubmit()}
                              />
                            )
                          }}
                        />
                      </div>
                    </div>
                  )
                }}
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">Pedro duarte</div>
            <div className="space-y-1">Pedro duarte</div>
          </CardContent>
          <CardFooter>
            <button>Save changes</button>
          </CardFooter>
        </Card>
        <FinalForm<FormValues>
          onSubmit={(values) => {
            if (!workspace?.id) return
            if (isEqual(values, initialValues)) return

            const valueChangedIsOpenAiApiKey = !isEqual(
              values.openAiApiKey,
              initialValues.openAiApiKey,
            )

            // Prevent submitting if the OpenAI key is masked
            if (
              valueChangedIsOpenAiApiKey &&
              values.openAiApiKey?.includes('•')
            ) {
              return
            }

            // We only send an update for the OpenAI key if
            // the billingStrategy is ApiKeys and the value is not masked
            const openAiApiKey = values.openAiApiKey?.includes('•')
              ? undefined
              : values.openAiApiKey ?? null

            updateWorkspace(
              {
                workspaceId: workspace.id,
                openAiApiKey,
              },
              {
                onSuccess: () => {
                  successToast(undefined, 'API keys updated')
                },
              },
            )
          }}
          initialValues={initialValues}
          render={({ handleSubmit }) => {
            return (
              <div className="space-y-2">
                <div className="text-sm text-zinc-600">
                  All the conversations will go through your OpenAI account, and
                  you will be billed directly by them.
                </div>
                <div className="grid grid-cols-2 py-2">
                  <Field
                    name="openAiApiKey"
                    render={({ input }) => {
                      return (
                        <InputField
                          {...input}
                          ref={inputRef}
                          label="OpenAI API key"
                          helperText={
                            <StyledLink
                              href="https://joiahq.notion.site/How-to-obtain-an-OpenAI-access-token-f29f71ba136145c9b84a43911c7d8709"
                              target="_blank"
                            >
                              Get help obtaining your OpenAI API key
                            </StyledLink>
                          }
                          onBlur={() => void handleSubmit()}
                        />
                      )
                    }}
                  />
                </div>
              </div>
            )
          }}
        />
      </SectionBody>
    </Section>
  )
}
