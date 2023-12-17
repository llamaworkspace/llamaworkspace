import { z } from 'zod'

export const zodUserOutput = z.object({
  id: z.string(),
  email: z.string().nullable(),
  name: z.string().nullable(),
  defaultOpenaiModel: z.string(),
})
