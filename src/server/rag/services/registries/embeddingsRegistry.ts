import { HugggingFaceEmbeddingStrategy } from '../strategies/embed/HuggingFaceEmbeddingStrategy'
import { OpenAIEmbeddingStrategy } from '../strategies/embed/OpenAIEmbeddingStrategy'
import type { IEmbeddingStrategy } from '../strategies/embed/embeddingStrategiesTypes'
import { GenericRegistry } from '../utils/GenericRegistry'

const embeddingsRegistry = new GenericRegistry<IEmbeddingStrategy>()
embeddingsRegistry.register(new OpenAIEmbeddingStrategy())
embeddingsRegistry.register(new HugggingFaceEmbeddingStrategy())

export { embeddingsRegistry }
