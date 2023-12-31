import _ from 'underscore'
import { aiRegistry } from '../ai/aiRegistry'

export const getTokenCostInNanoCents = (
  tokens: number,
  type: 'request' | 'response',
  providerName: string,
  modelName: string,
) => {
  const provider = aiRegistry.getProvider(providerName)

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
