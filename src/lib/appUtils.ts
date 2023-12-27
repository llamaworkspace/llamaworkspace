export const maskValueWithBullets = (value: string) => {
  if (!value) return value
  const bullets = '••••••••••••••••'
  if (value.length < 5) {
    return bullets
  }
  if (value.length < 12) {
    return value?.slice(0, 3) + '••••••••••••••••' + value?.slice(-2)
  }
  return value?.slice(0, 4) + '••••••••••••••••' + value?.slice(-3)
}
