import { z } from 'zod'

export const zodUserOutput = z.object({
  id: z.string(),
  email: z.string().nullable(),
  name: z.string().nullable(),
  defaultModel: z.string(),
  workspace: z
    .object({
      id: z.string(),
      name: z.string(),
      onboardingCompletedAt: z.date().nullable(),
    })
    .optional(),
})
