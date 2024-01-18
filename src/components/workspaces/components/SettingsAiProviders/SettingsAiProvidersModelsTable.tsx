import { CheckboxField } from '@/components/ui/forms/CheckboxField'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { numberToUsd } from '@/lib/utils'
import type { AiRegistryModel } from '@/server/lib/ai-registry/aiRegistryTypes'
import { Field } from 'react-final-form'
export const SettingsAiProvidersModelsTable = ({
  models,
  showCosts = false,
}: {
  models: AiRegistryModel[]
  showCosts?: boolean
}) => {
  return (
    <div className="space-y-2">
      <div className="text-xl font-bold">Models</div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[320px]">Name</TableHead>
            <TableHead>Slug</TableHead>
            {showCosts && (
              <>
                <TableHead>Input*</TableHead>
                <TableHead>Response*</TableHead>
              </>
            )}
            <TableHead>Enabled</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {models?.map((model) => (
            <TableRow key={model.slug} className="h-10">
              <TableCell>{model.publicName}</TableCell>
              <TableCell>
                <span className="font-mono bg-zinc-100 px-0.5 text-pink-600">
                  {model.slug}
                </span>
              </TableCell>
              {showCosts && (
                <>
                  <TableCell>
                    {numberToUsd(model.costPerMille?.request ?? 0)}
                  </TableCell>
                  <TableCell>
                    {numberToUsd(model.costPerMille?.response ?? 0)}
                  </TableCell>
                </>
              )}
              <TableCell>
                <Field
                  name={`models.${model.slug.replaceAll('.', '^')}.enabled`}
                  render={({ input }) => {
                    const handleCheckToggle = (checked: boolean) => {
                      input.onChange(checked)
                    }

                    return (
                      <CheckboxField
                        checked={!!input.value}
                        onCheckedChange={handleCheckToggle}
                      />
                    )
                  }}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {showCosts && (
        <div className="mt-2 text-xs text-zinc-500">
          * Cost per 1,000 tokens
        </div>
      )}
    </div>
  )
}
