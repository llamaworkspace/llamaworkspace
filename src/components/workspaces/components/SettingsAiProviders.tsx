import {
  useUpdateAiProvider,
  useWIPNextAiProviderMaster,
} from '@/components/ai/aiHooks'
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
import { useCurrentWorkspace } from '../workspacesHooks'
import { SettingsAiProvidersModelsTable } from './SettingsAiProviders/SettingsAiProvidersModelsTable'

type FormValues = Record<string, string>

export const SettingsAiProviders = () => {
  const successToast = useSuccessToast()
  const { mutate: updateAiProvider } = useUpdateAiProvider()

  const navigation = useNavigation()
  const { workspace } = useCurrentWorkspace()
  const { data: providers } = useWIPNextAiProviderMaster()
  console.log('providers2', providers)
  const inputRef = useRef<HTMLInputElement>(null)

  const focusQueryStringEl = navigation.query?.focus

  useEffect(() => {
    if (inputRef.current && focusQueryStringEl === 'openai_api_key') {
      inputRef.current.focus()
    }
  }, [focusQueryStringEl])

  const handleFormSubmit = (providerSlug: string) => (values: FormValues) => {
    if (!workspace?.id) return

    const provider = providers?.find((p) => p.slug === providerSlug)

    const submitValues = provider?.fields.reduce((acc, field) => {
      let fieldValue: string | null | undefined = values[field.slug]

      if (fieldValue?.includes('•')) {
        return acc
      }

      fieldValue = fieldValue ?? null

      return {
        ...acc,
        [field.slug]: fieldValue,
      }
    }, {}) as Record<string, string>

    updateAiProvider(
      { workspaceId: workspace.id, providerSlug, values: submitValues },
      {
        onSuccess: () => {
          successToast(undefined, 'Provider updated')
        },
      },
    )
  }

  return (
    <Section>
      <SectionHeader title="AI Service Providers" />
      <SectionBody>
        <div className="mb-12 space-y-4">
          {/* <div className="text-zinc-700">
            Add AI service providers like OpenAI, Hugging Face or Amazon
            Bedrock, to power the chats in your workspace. You can add multiple
            providers and later choose which one to use on a case by case basis.
          </div>
          <div>
            <Button>Add AI provider</Button>
          </div> */}
        </div>

        {providers?.map((provider) => {
          const isOpenAi = provider.slug === 'openai'

          return (
            <FinalForm<FormValues>
              key={provider.slug}
              onSubmit={handleFormSubmit(provider.slug)}
              initialValues={provider.providerValues}
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
                                      required={field.required}
                                    />
                                  )
                                }}
                              />
                            )
                          })}
                        </div>

                        <SettingsAiProvidersModelsTable
                          models={provider.models}
                        />
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
