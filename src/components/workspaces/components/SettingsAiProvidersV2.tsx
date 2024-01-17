import { useAiProvidersV2 } from '@/components/ai/aiHooks'
import { Section, SectionBody, SectionHeader } from '@/components/ui/Section'
import { Button } from '@/components/ui/button'
import { SettingsAiProvidersEditModelsModal } from './SettingsAiProviders/SettingsAiProvidersEditModelsModal'
import { SettingsAiProvidersEditProviderModal } from './SettingsAiProviders/SettingsAiProvidersEditProviderModal'

export const SettingsAiProvidersV2 = () => {
  const { data: providers } = useAiProvidersV2()

  return (
    <Section>
      <SectionHeader title="AI Service Providers" />
      <SectionBody>
        <div className="mb-12 space-y-4">
          <div className="text-zinc-700">
            Add AI service providers like OpenAI, Hugging Face or Amazon
            Bedrock, to power conversations in your workspace.
          </div>
          <div>
            <Button>Add AI provider</Button>
          </div>
        </div>
        <div className="">
          {providers?.map((provider) => {
            return (
              <div
                key={provider.slug}
                className="flex justify-between space-y-1 border-b py-2"
              >
                <div>
                  <div className="font-semibold">{provider.publicName}</div>
                  <div className="text-xs text-zinc-400">
                    3/7 models enabled
                  </div>
                </div>
                <div>
                  <Button size={'sm'} variant={'secondary'}>
                    Edit
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
        <SettingsAiProvidersEditProviderModal
          aiProviderId={providers?.[0]?.slug}
        />
        <SettingsAiProvidersEditModelsModal
          aiProviderId={providers?.[0]?.slug}
        />
      </SectionBody>
    </Section>
  )
}
