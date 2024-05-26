export const maskValueWithBullets = (value: string) => {
  if (!value) return value
  const bullets = '••••••••••••••••'
  if (value.length < 12) {
    return bullets
  }

  return value?.slice(0, 4) + '••••••••••••••••' + value?.slice(-3)
}
