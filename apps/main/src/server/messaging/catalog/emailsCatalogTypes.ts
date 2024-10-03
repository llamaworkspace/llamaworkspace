import { ZodRawShape, z } from 'zod'

export interface EmailCatalogItem {
  name: string
  reactFC: React.FC
  paramsValidator: z.ZodObject<ZodRawShape>
}
