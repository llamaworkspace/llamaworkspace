import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { debounce } from 'underscore'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function reverseMap<T, U>(
  array: T[],
  mapFn: (item: T, index: number, array: T[]) => U,
): U[] {
  const result: U[] = []
  for (let i = array.length - 1; i >= 0; i--) {
    const line = array[i]
    if (line !== undefined) {
      result.push(mapFn(line, i, array))
    }
  }
  return result
}

export function generateToken(length = 36) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

export function getEnumByValue<T extends Record<string, unknown>>(
  targetEnum: T,
  enumValue: string,
) {
  const keys = Object.keys(targetEnum).filter(
    (x) => targetEnum[x as keyof T] === enumValue,
  ) as Array<keyof T>
  if (!keys[0]) {
    throw new Error(`No key found for enum value "${enumValue}"`)
  }
  return targetEnum[keys[0]]
}

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type DebouncedFunction<T extends (...args: any[]) => any> = (
  ...args: Parameters<T>
) => ReturnType<T>

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export function serialDebouncer<F extends (...args: any[]) => any>(
  func: F,
  debounceMs?: number,
): DebouncedFunction<F> {
  const finalDebounceMs = debounceMs ?? 0
  return debounce(func, finalDebounceMs)
}

export const mergeRefs = <T>(
  refs: (React.RefObject<T> | React.ForwardedRef<T>)[],
): React.RefCallback<T> => {
  return (value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === 'function') {
        ref(value)
      } else if (ref) {
        const _ref = ref as React.MutableRefObject<T | null>
        _ref.current = value
      }
    })
  }
}

export const numberToUsd = (
  number: number,
  minDecimals = 2,
  maxDecimals?: number,
) => {
  if (maxDecimals && minDecimals > maxDecimals) {
    maxDecimals = minDecimals
  }
  const numberToUsdConverter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  })
  return numberToUsdConverter.format(number)
}

// Utility function to ensure we're working with a proper Error object
export const ensureError = (err: unknown): Error => {
  if (err instanceof Error) {
    return err
  }

  // If the thrown value isn't an Error but has an error-like structure
  if (typeof err === 'object' && err && 'message' in err) {
    return Object.assign(new Error((err as { message: string }).message), err)
  }

  // For other cases, such as when a string or number is thrown
  return new Error(String(err))
}

export const maskValueWithBullets = (value: string) => {
  if (!value) return value
  const bullets = '••••••••••••••••'
  if (value.length < 12) {
    return bullets
  }

  return value?.slice(0, 4) + '••••••••••••••••' + value?.slice(-3)
}
