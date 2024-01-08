import { useAiProviders, useUpdateAiProvider } from '@/components/ai/aiHooks'
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
import { useEffect, useMemo, useRef } from 'react'
import { Field, Form as FinalForm } from 'react-final-form'
import _, { groupBy, mapObject } from 'underscore'
import { useCurrentWorkspace } from '../workspacesHooks'
import { SettingsAiProvidersModelsTable } from './SettingsAiProviders/SettingsAiProvidersModelsTable'

type PartialFormValuesForModels = Record<
  'models',
  Record<string, { enabled: boolean }>
>
type FormValues = Record<string, string> | PartialFormValuesForModels

export const SettingsAiProviders = () => {
  const successToast = useSuccessToast()
  const { mutate: updateAiProvider } = useUpdateAiProvider()

  const navigation = useNavigation()
  const { data: workspace } = useCurrentWorkspace()
  const { data: providers } = useAiProviders()

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

    const aiProviderValues = provider?.fields.reduce((acc, field) => {
      const coercedValues = values as Record<string, string>

      let fieldValue: string | null | undefined = coercedValues[field.slug]

      if (fieldValue?.includes('•')) {
        return acc
      }

      fieldValue = fieldValue ?? null

      return {
        ...acc,
        [field.slug]: fieldValue,
      }
    }, {}) as Record<string, string>

    const modelValues = (values?.models ??
      {}) as PartialFormValuesForModels['models']

    const modelsValues = _.map(modelValues, (model, slug) => {
      return {
        slug: slug.replaceAll('^', '.'),
        enabled: model.enabled,
      }
    })

    updateAiProvider(
      {
        workspaceId: workspace.id,
        providerSlug,
        keyValues: aiProviderValues,
        models: modelsValues,
      },
      {
        onSuccess: () => {
          successToast(undefined, 'Provider updated')
        },
      },
    )
  }

  const initialValues = useMemo(() => {
    if (!providers) return

    const groupedProviders = groupBy(providers, 'slug')

    return mapObject(groupedProviders, (provider) => {
      return provider.reduce((acc, provider) => {
        const modelsInitialValues = provider.models.reduce((acc, model) => {
          return {
            ...acc,
            [model.slug.replaceAll('.', '^')]: {
              enabled: model.isEnabled,
            },
          }
        }, {})

        return {
          ...provider.providerValues,
          models: modelsInitialValues,
        }
      }, {}) as Record<string, FormValues>
    })
  }, [providers])

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
              initialValues={initialValues?.[provider.slug]}
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
