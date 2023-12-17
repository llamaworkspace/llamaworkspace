import type { ZodObject, ZodRawShape, z } from 'zod'

export function validateFormWithZod<Z extends ZodObject<ZodRawShape>>(zod: Z) {
  return (values: z.infer<Z>) => {
    const result = zod.safeParse(values)
    return result.success ? {} : result.error.flatten().fieldErrors
  }
}

type StringOrNumber = string | number

type FinalFormValidator<T> = (value: T) => string | undefined
type FinalFormValidatorWithParams<P, T> = (
  param: P,
) => (value: T) => string | undefined

export const stringOrNumberRequired: FinalFormValidator<StringOrNumber> = (
  value: StringOrNumber,
) => (value ? undefined : 'This field is required')

export const minLength: FinalFormValidatorWithParams<number, string> =
  (minValue: number) => (value: string) => {
    return value && value.length < minValue
      ? `It must contain at least ${minValue} characters`
      : undefined
  }

export const maxLength: FinalFormValidatorWithParams<number, string> =
  (maxValue: number) => (value: string) => {
    return value && value.length > maxValue
      ? `It must contain at least ${maxValue} characters`
      : undefined
  }

export const minNumber: FinalFormValidatorWithParams<number, number> =
  (min: number) => (value: number) => {
    return value && value < min ? `It must be at least ${min}` : undefined
  }

export const maxNumber: FinalFormValidatorWithParams<number, number> =
  (max: number) => (value: number) => {
    return value && value > max ? `It must be at least ${max}` : undefined
  }

export const passwordMinMaxLength: FinalFormValidator<string> = (
  value: string,
) => {
  const minValue = 8
  const maxValue = 99
  const invalidText = `Este campo debe contener entre ${minValue} y ${maxValue} carácteres`
  return value && (value.length < minValue || value.length > maxValue)
    ? invalidText
    : undefined
}

export const email: FinalFormValidator<string> = (value: string) => {
  return value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,99}$/i.test(value)
    ? 'It must be a valid email address'
    : undefined
}

export const phoneNumber: FinalFormValidator<string> = (value: string) => {
  return value && !/^(\+|\d)[0-9\s]+$/i.test(value)
    ? 'Phone number invalid. Use numbers only, with no empty spaces'
    : undefined
}

export const passwordChars: FinalFormValidator<string> = (value: string) => {
  return value && !/^[A-Za-z0-9!@#$%^&*()_.-]+$/.test(value)
    ? 'Password can only contain numbers, letters or the following symbols: ! @ # $ % ^ & * ( ) _ . -'
    : undefined
}

export const url: FinalFormValidator<string> = (value: string) => {
  return value &&
    !/^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,99}(:[0-9]{1,5})?(\/.*)?$/i.test(
      value,
    )
    ? 'Invalid URL'
    : undefined
}

export const composeValidators =
  <T>(...validators: FinalFormValidator<T>[]) =>
  (value: T) => {
    return validators.reduce(
      (errorOrUndefined: undefined | string, validator) =>
        errorOrUndefined ?? validator(value),
      undefined,
    )
  }
