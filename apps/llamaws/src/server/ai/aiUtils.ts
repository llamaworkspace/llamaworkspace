export const getProviderAndModelFromFullSlug = (fullSlug: string) => {
  const [provider, ...modelArr] = fullSlug.split('/')
  const model = modelArr.join('/')

  if (!provider || !model) {
    throw new Error(`Provider or model is undefined. FullSlug: ${fullSlug}`)
  }

  return { provider, model }
}
