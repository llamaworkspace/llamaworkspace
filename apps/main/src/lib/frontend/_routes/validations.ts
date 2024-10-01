import type { Configuration, DefaultConfiguration } from './configuration'

type ValidateVariableStartNotEmpty<Config extends Configuration> =
  Config['variableStart'] extends ''
    ? `Variable start '${Config['variableStart']}' is empty`
    : true

type ValidateVariableStartNoSlashes<Config extends Configuration> =
  Config['variableStart'] extends `${string}/${string}`
    ? `Variable start '${Config['variableStart']}' contains slashes`
    : true

type ValidateVariableEndNoSlashes<Config extends Configuration> =
  Config['variableEnd'] extends `${string}/${string}`
    ? `Variable end '${Config['variableEnd']}' contains slashes`
    : true

type ValidatePathNoEmptyVariables<
  Paths extends string,
  Config extends Configuration,
> = Paths extends `${string}${Config['variableStart']}${Config['variableEnd']}/${string}`
  ? `Path '${Paths}' contains empty variables`
  : Paths extends `${string}${Config['variableStart']}${Config['variableEnd']}`
    ? `Path '${Paths}' contains empty variables`
    : true

/* TODO: Implement this
type ValidatePathVariablesMustBeRightAfterSlash<
  Paths extends string,
  Config extends Configuration,
> = true
*/

type ValidatePathNoDoubleSlashes<Paths extends string> =
  Paths extends `${string}//${string}`
    ? `Path '${Paths}' contains double slashes`
    : true

type PathValidations<
  Paths extends string,
  Config extends Configuration = DefaultConfiguration,
> = [
  ValidateVariableStartNotEmpty<Config>,
  ValidateVariableStartNoSlashes<Config>,
  ValidateVariableEndNoSlashes<Config>,
  ValidatePathNoEmptyVariables<Paths, Config>,
  ValidatePathNoDoubleSlashes<Paths>,
]

type ContainsError<T extends unknown[]> = T extends [infer F, ...infer Rest]
  ? F extends string
    ? true
    : ContainsError<Rest>
  : never

export type ValidateConfiguration<
  Paths extends string,
  Config extends Configuration,
> = ContainsError<PathValidations<Paths, Config>> extends never ? Paths : never

/**
 * Tuple with the failed validations of <Paths, Config>.
 * Use as `type Errors = PathErrors<'MyPath1' | 'MyPath2', OptionalConfig>`,
 * and see in the type which validations failed.
 */
export type PathErrors<
  Paths extends string,
  Config extends Configuration,
> = Exclude<PathValidations<Paths, Config>[number], true>
