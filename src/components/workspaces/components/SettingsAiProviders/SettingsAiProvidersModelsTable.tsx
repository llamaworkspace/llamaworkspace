import { useAiModelsMetaForProvider } from '@/components/ai/aiHooks'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const SettingsAiProvidersModelsTable = ({
  providerSlug,
}: {
  providerSlug: string
}) => {
  // here
  const { data: aiModels } = useAiModelsMetaForProvider(providerSlug)

  return (
    <div className="space-y-4">
      <div className="text-xl font-bold">Models</div>
      <ul>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[320px]">Name</TableHead>
              <TableHead>Slug</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aiModels?.map((model) => (
              <TableRow key={model.slug}>
                <TableCell>{model.publicName}</TableCell>{' '}
                <TableCell>
                  <span className="font-mono bg-zinc-100 px-0.5 text-pink-600">
                    {model.slug}
                  </span>
                </TableCell>
                <TableCell className="text-right">{model.isCustom}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ul>
    </div>
  )
}
