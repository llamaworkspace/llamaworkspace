import _ from 'underscore'
import { aiProvidersFetcher } from '../ai/services/aiProvidersFetcher.service'

export const getTokenCostInNanoCents = (
  tokens: number,
  type: 'request' | 'response',
  providerName: string,
  modelName: string,
) => {
  const provider = aiProvidersFetcher.getProvider(providerName)

  if (!provider) {
    return null
  }

  const model = provider.models.find((model) => model.slug === modelName)
  if (!model) {
    return null
  }

  const costPerMille = model.costPerMille?.[type]
  if (_.isUndefined(costPerMille)) {
    return null
  }

  return Math.round(tokens * costPerMille * 1_000_000)
}
