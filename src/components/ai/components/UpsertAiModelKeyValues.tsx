import { Button } from '@/components/ui/button'
import { InputField } from '@/components/ui/forms/InputField'
import { useSuccessToast } from '@/components/ui/toastHooks'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useCurrentWorkspace } from '@/components/workspaces/workspacesHooks'
import { InformationCircleIcon } from '@heroicons/react/20/solid'
import { Field, Form as FinalForm } from 'react-final-form'
import { useAiProviders, useUpdateAiModel } from '../aiHooks'

export const UpsertAiModelKeyValues = () => {
  const { mutate: updateAiModel } = useUpdateAiModel()
  const { workspace } = useCurrentWorkspace()
  const toast = useSuccessToast()

  // We need a list of model params, merged with their values in postConfigVersion

  // TEMP, fixme
  const { data: providers } = useAiProviders(['openai'])
  const TEMP_MODEL_TO_USE = 'gpt-4-1106-preview'
  const provider = providers?.[0]

  const model = provider?.models?.find((m) => m.slug === TEMP_MODEL_TO_USE)

  const handleSubmit = (values: Record<string, string | number>) => {
    if (!workspace?.id || !provider?.slug || !model?.slug) return
    const stringValues = Object.entries(values).reduce((acc, [key, value]) => {
      return { ...acc, [key]: String(value) }
    }, {})

    updateAiModel(
      {
        workspaceId: workspace.id,
        providerSlug: provider.slug,
        modelSlug: model.slug,
        keyValues: stringValues,
      },
      {
        onSuccess: () => {
          toast(undefined, 'Parameters updated')
        },
      },
    )
  }

  return (
    <FinalForm
      onSubmit={handleSubmit}
      render={({ handleSubmit }) => {
        return (
          <div className="py-4">
            <div className="space-y-4">
              {model?.fields.map((field) => {
                const label = (
                  <span className="inline-flex items-center">
                    {field.publicName}{' '}
                    {field.description && (
                      <ParameterTooltip description={field.description} />
                    )}
                  </span>
                )
                return (
                  <div key={field.slug}>
                    <Field
                      name={field.slug}
                      render={({ input }) => {
                        // Todo: Apply form validations of min and max!
                        return (
                          <InputField
                            {...input}
                            type={field.type === 'number' ? 'number' : 'text'}
                            label={label}
                          />
                        )
                      }}
                    />
                  </div>
                )
              })}
            </div>
            <Button
              className="mt-4"
              type="submit"
              onClick={() => void handleSubmit()}
            >
              Submit
            </Button>
          </div>
        )
      }}
    ></FinalForm>
  )
}

const ParameterTooltip = ({ description }: { description: string }) => {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>
        <InformationCircleIcon className="ml-1 h-4 w-4" />
      </TooltipTrigger>
      <TooltipContent className="max-w-[300px]">{description}</TooltipContent>
    </Tooltip>
  )
}
