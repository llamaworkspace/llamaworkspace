import { faker } from '@faker-js/faker'

export const generateBaseForDefaults = () => {
  const createdAt = faker.date.recent()
  return { id: faker.string.nanoid(), createdAt, updatedAt: createdAt }
}
