import { useAiModels } from '@/components/ai/aiHooks'
import {
  SelectField,
  type SelectFieldProps,
} from '@/components/ui/forms/SelectField'
import { useMemo } from 'react'
import { uniq } from 'underscore'

interface AiModelSelectorProps extends Omit<SelectFieldProps, 'options'> {
  loadingEl?: JSX.Element
}

export const SelectAiModelsFormField = ({
  loadingEl,
  ...selectProps
}: AiModelSelectorProps) => {
  const fieldValue = selectProps.value

  const { data: aiModels, isLoading } = useAiModels({ isSetupOk: true })
  const { data: aiModelsFiltered } = useAiModels({
    fullSlugs: fieldValue ? [fieldValue] : undefined,
  })

  const finalAiModelsColl = useMemo(() => {
    if (!aiModels) return []
    if (!aiModelsFiltered) return []
    return uniq(aiModels.concat(aiModelsFiltered))
  }, [aiModels, aiModelsFiltered])

  const modelOptions = useMemo(() => {
    if (!finalAiModelsColl) return []
    return finalAiModelsColl.map((model) => ({
      value: model.fullSlug,
      label: `${model.fullPublicName} ${model.isSetupOk ? '' : '(disabled)'}`,
      disabled: !model.isSetupOk,
    }))
  }, [finalAiModelsColl])

  if (isLoading && loadingEl) {
    return loadingEl
  }

  return (
    <SelectField
      {...selectProps}
      options={modelOptions}
      emptyStateContent={EmptyStateContent}
    />
  )
}

const EmptyStateContent = () => {
  return (
    <div className="max-w-[400px] p-4 text-center text-sm text-zinc-400">
      <div className="font-semibold">There are no models enabled.</div>
      <div>
        On the top-left menu, navigate to &quot;Workspace settings&quot; &gt;
        &quot;AI Providers&quot; and enable at least one.
      </div>
    </div>
  )
}
