import { useWIPEnabledAiModels } from '@/components/ai/aiHooks'
import {
  SelectField,
  type SelectFieldProps,
} from '@/components/ui/forms/SelectField'
import { useMemo } from 'react'

export const SelectAiModelsFormField = ({
  ...selectProps
}: Omit<SelectFieldProps, 'options'>) => {
  const { data: aiModels } = useWIPEnabledAiModels()

  const modelOptions = useMemo(() => {
    if (!aiModels) return []
    return aiModels.map((model) => ({
      value: model.slug,
      label: model.fullPublicName,
    }))
  }, [aiModels])

  return <SelectField {...selectProps} options={modelOptions} />
}
