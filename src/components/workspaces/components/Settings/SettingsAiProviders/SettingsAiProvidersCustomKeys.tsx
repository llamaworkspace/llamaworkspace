import { useAiProviders, useUpdateAiProvider } from '@/components/ai/aiHooks'
import { StyledLink } from '@/components/ui/StyledLink'
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
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { useMemo } from 'react'
import { Field, Form as FinalForm } from 'react-final-form'
import _, { groupBy, mapObject } from 'underscore'
import { SettingsAiProvidersModelsTable } from './SettingsAiProvidersModelsTable'
type PartialFormValuesForModels = Record<
  'models',
  Record<string, { enabled: boolean }>
>
type FormValues = Record<string, string> | PartialFormValuesForModels

export const SettingsAiProvidersCustomKeys = () => {
  const successToast = useSuccessToast()
  const { mutate: updateAiProvider } = useUpdateAiProvider()

  const { data: workspace } = useCurrentWorkspace()
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
        Use your own API keys to connect to AI providers.
      </div>

      {providers?.map((provider) => {
        return (
          <FinalForm<FormValues>
            key={provider.slug}
            onSubmit={handleFormSubmit(provider.slug)}
            initialValues={initialValues?.[provider.slug]}
            render={({ handleSubmit }) => {
              return (
                <Card key={provider.slug}>
                  <CardHeader className="mb-4 space-y-2">
                    <CardTitle className="text-2xl">
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
                  <CardContent className="space-y-8">
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
                    </div>
                    <SettingsAiProvidersModelsTable models={provider.models} />
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
