const SELF_CONTAINED_FILE_TYPES = ['pdf', 'docx', 'pptx', 'csv']

export const mapFileTypeToLoaderType = (type: string) => {
  const finalType = type.replace('.', '')
  if (SELF_CONTAINED_FILE_TYPES.includes(finalType)) {
    return finalType
  }
  return 'txt'
}
