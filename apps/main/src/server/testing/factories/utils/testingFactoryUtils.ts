import { faker } from '@faker-js/faker'

export const generateBaseForDefaults = () => {
  const createdAt = new Date()
  return { id: faker.string.nanoid(), createdAt, updatedAt: createdAt }
}
