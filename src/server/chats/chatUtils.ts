import type { OpenAiModelEnum } from '@/shared/aiTypesAndMappers'
import { BASE_TOKEN_CPM } from './tokenPricing'

export const getTokenCostInNanoCents = (
  tokens: number,
  type: 'request' | 'response',
  model: OpenAiModelEnum,
) => {
  const tokenCost = BASE_TOKEN_CPM[`${model}_${type}`] / 1000
  if (!tokenCost) {
    throw new Error(`No price found for model: ${model} and type: ${type}`)
  }
  return Math.round(tokens * tokenCost * 1_000_000_000)
}
