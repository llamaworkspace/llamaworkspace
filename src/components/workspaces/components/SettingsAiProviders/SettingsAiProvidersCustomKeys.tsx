import { useAiProviders, useUpdateAiProvider } from '@/components/ai/aiHooks'
import { StyledLink } from '@/components/ui/StyledLink'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
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
import { useMemo } from 'react'
import { Field, Form as FinalForm } from 'react-final-form'
import _, { groupBy, mapObject } from 'underscore'
import { useCurrentWorkspace } from '../../workspacesHooks'
import { SettingsAiProvidersModelsTable } from './SettingsAiProvidersModelsTable'
type PartialFormValuesForModels = Record<
  'models',
  Record<string, { enabled: boolean }>
>
type FormValues = Record<string, string> | PartialFormValuesForModels

export const SettingsAiProvidersCustomKeys = () => {
  const successToast = useSuccessToast()
  const { mutate: updateAiProvider } = useUpdateAiProvider()

  const { workspace } = useCurrentWorkspace()
  const { data: providers } = useAiProviders()

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
    <div className="space-y-8">
      <div className="text-zinc-600">
        Use your own API keys to connect to AI providers like OpenAI, Amazon
        Bedrock, Openrouter or Hugging Face.
      </div>

      {providers?.map((provider) => {
        return (
          <FinalForm<FormValues>
            key={provider.slug}
            onSubmit={handleFormSubmit(provider.slug)}
            initialValues={initialValues?.[provider.slug]}
            render={({ handleSubmit }) => {
              const isOpenAi = provider.slug === 'openai'
              const showOpenAiDefaultKeysAlert =
                isOpenAi &&
                provider.hasFallbackCredentials &&
                provider.hasMissingFields

              return (
                <Card key={provider.slug}>
                  <CardHeader>
                    <CardTitle className="text-xl">
                      <div className="flex items-center gap-x-2">
                        <div>{provider.publicName}</div>
                      </div>
                    </CardTitle>
                    {provider.docsLink && (
                      <CardDescription>
                        <StyledLink href={provider.docsLink} target="_blank">
                          {provider.docsLinkText ?? 'Documentation'}
                        </StyledLink>
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {showOpenAiDefaultKeysAlert && <DefaultOpenAiKeyAlert />}
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
                                  label={field.publicName}
                                  required={field.required}
                                />
                              )
                            }}
                          />
                        )
                      })}

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
    </div>
  )
}

const DefaultOpenAiKeyAlert = () => {
  return (
    <Alert variant="fuchsia">
      <AlertTitle>Default OpenAI keys being used</AlertTitle>
      <AlertDescription>
        Since you haven&apos;t set up the OpenAI API credentials here, Joia will
        use the OpenAI API keys defined in the environment variables.
      </AlertDescription>
    </Alert>
  )
}
