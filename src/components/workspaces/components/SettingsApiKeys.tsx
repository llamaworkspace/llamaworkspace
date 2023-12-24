import {
  useProviders,
  useUpdateProvider,
} from '@/components/providers/providersHooks'
import { Section, SectionBody, SectionHeader } from '@/components/ui/Section'
import { StyledLink } from '@/components/ui/StyledLink'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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

type FormValues = Record<string, string>

export const SettingsApiKeys = () => {
  const { mutate: updateWorkspace } = useUpdateWorkspace()
  const successToast = useSuccessToast()
  const { mutate: updateProvider } = useUpdateProvider()
  const navigation = useNavigation()
  const { workspace } = useCurrentWorkspace()
  const { data: providers } = useProviders()
  console.log('FE Providers', providers)
  const inputRef = useRef<HTMLInputElement>(null)

  const focusQueryStringEl = navigation.query?.focus

  useEffect(() => {
    if (inputRef.current && focusQueryStringEl === 'openai_api_key') {
      inputRef.current.focus()
    }
  }, [focusQueryStringEl])

  // FIX: Null when empty value
  const initialValues = {
    openAiApiKey: workspace?.openAiApiKey ?? null,
  }

  const handleFormSubmit = (providerSlug: string) => (values: FormValues) => {
    if (!workspace?.id) return

    updateProvider(
      { workspaceId: workspace.id, providerSlug, values },
      {
        onSuccess: () => {
          successToast(undefined, 'Provider updated')
        },
      },
    )
    const valueChangedIsOpenAiApiKey = !isEqual(
      values.openAiApiKey,
      initialValues.openAiApiKey,
    )

    // Prevent submitting if the OpenAI key is masked
    if (valueChangedIsOpenAiApiKey && values.openAiApiKey?.includes('•')) {
      return
    }

    // We only send an update for the OpenAI key if
    // the billingStrategy is ApiKeys and the value is not masked
    const openAiApiKey = values.openAiApiKey?.includes('•')
      ? undefined
      : values.openAiApiKey ?? null
  }

  return (
    <Section>
      <SectionHeader title="AI Services" />
      <SectionBody>
        <div>
          All interactions will be routed through the AI provider accounts, and
          you will be billed directly by them.
        </div>

        {providers?.map((provider) => {
          const isOpenAi = provider.slug === 'openai'
          return (
            <FinalForm<FormValues>
              key={provider.slug}
              onSubmit={handleFormSubmit(provider.slug)}
              initialValues={provider.fieldValues}
              render={({ handleSubmit }) => {
                return (
                  <Card key={provider.slug}>
                    <CardHeader>
                      <CardTitle className="text-xl">
                        <div className="flex items-center gap-x-2">
                          <div>{provider.publicName}</div>
                          {isOpenAi && (
                            <Badge variant="yellow" size="xs">
                              Required
                            </Badge>
                          )}
                        </div>
                      </CardTitle>
                      <CardDescription>
                        <StyledLink
                          href="https://joiahq.notion.site/How-to-obtain-an-OpenAI-access-token-f29f71ba136145c9b84a43911c7d8709"
                          target="_blank"
                        >
                          Get help obtaining your OpenAI API key
                        </StyledLink>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="space-y-2">
                        <div className="space-y-4 py-2">
                          {provider.fields.map((field) => {
                            return (
                              <Field
                                key={field.slug}
                                name={field.slug}
                                render={({ input }) => {
                                  return (
                                    <InputField
                                      {...input}
                                      ref={inputRef}
                                      label={field.publicName}
                                      isRequired={!field.isOptional}
                                    />
                                  )
                                }}
                              />
                            )
                          })}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button onClick={() => void handleSubmit()}>
                        Save changes
                      </Button>
                    </CardFooter>
                  </Card>
                )
              }}
            />
          )
        })}
      </SectionBody>
    </Section>
  )
}
