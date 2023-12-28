const midStreamErrorRegex =
  /=====MID_STREAM_ERROR=====(.*?)=====END_MID_STREAM_ERROR=====/

export const extractErrors = (value: string) => {
  if (!value.includes('=====MID_STREAM_ERROR=====')) {
    return
  }

  const match = value.match(midStreamErrorRegex)

  return match?.[1]
}
