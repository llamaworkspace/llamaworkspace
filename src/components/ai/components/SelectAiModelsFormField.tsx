import { useEnabledAiModels } from '@/components/ai/aiHooks'
import {
  SelectField,
  type SelectFieldProps,
} from '@/components/ui/forms/SelectField'
import { useMemo } from 'react'

interface AiModelSelectorProps extends Omit<SelectFieldProps, 'options'> {
  loadingEl?: JSX.Element
}

export const SelectAiModelsFormField = ({
  loadingEl,
  ...selectProps
}: AiModelSelectorProps) => {
  const { data: aiModels, isLoading } = useEnabledAiModels()

  const modelOptions = useMemo(() => {
    if (!aiModels) return []
    return aiModels.map((model) => ({
      value: model.fullSlug,
      label: model.fullPublicName,
    }))
  }, [aiModels])

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
