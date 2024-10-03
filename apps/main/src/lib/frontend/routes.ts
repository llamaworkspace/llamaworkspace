import type { NextRouter } from 'next/router'
import { type Configuration } from './_routes/configuration'
import type { ParameterValues, Query, Route } from './_routes/routes'
import type { ValidateConfiguration } from './_routes/validations'

export {
  defaultConfiguration,
  type Configuration,
  type DefaultConfiguration,
} from './_routes/configuration'
export type { PathErrors } from './_routes/validations'

/**
 * Raw path builder.
 *
 * Check {@link makeNavigation} for more information.
 */
export function buildPath<Paths extends string, Config extends Configuration>(
  rawPath: Paths,
  configuration: Config,
  parameters?: ParameterValues<Paths, Config>,
  query?: Query,
) {
  if (!parameters) {
    return rawPath
  }

  const path = Object.entries(parameters).reduce<string>(
    (currentPath, [param, value]) =>
      currentPath.replaceAll(
        `${configuration.variableStart}${param}${configuration.variableEnd}`,
        String(value),
      ),
    rawPath,
  )

  if (!query) {
    return path
  }

  const queryString = Object.entries(query)
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  return `${path}?${queryString}`
}

/**
 * Creates a navigation object that can be used to navigate through the app.
 *
 * The first `Paths` generic parameter is the type of the paths that will be used.
 * It should be a union of strings, each one representing a path.
 *
 * The second `Config` generic parameter corresponds with the second parameter,
 * and defines the configuration of the variables.
 * By default it uses `:` as the variable start, with no end, resulting in paths like `/a/:b`.
 * You can change it to something like `${` and `}` to get paths like `/a/${b}`.
 * An empty string on the end means until the next slash.
 *
 * Because of TypeScript limitations, you must define both the generic and parameter configuration.
 *
 * Example of usage:
 * ```ts
 * const validNavigation = makeNavigation<
 *   'my',
 *   'my/:a/path',
 *   'my/:a/path/:b',
 *   DefaultConfiguration
 * >(
 *   yourRouter,
 *   defaultConfiguration,
 * )
 * ```
 *
 * @param router The router that will be used by the navigation
 * @param configuration The configuration object
 * @returns A router with typed methods
 */
export function makeNavigation<
  Paths extends string,
  Config extends Configuration,
>(
  router: NextRouter,
  configuration: Config,
): Route<ValidateConfiguration<Paths, Config>, Config> {
  return {
    buildPath: <Path extends Paths>(
      path: Path,
      parameters?: ParameterValues<Path, Config>,
      query?: Query,
    ) => buildPath(path, configuration, parameters, query),
    push: async <Path extends Paths>(
      path: Path,
      parameters?: ParameterValues<Path, Config>,
      query?: Query,
    ) => {
      await router.push(buildPath(path, configuration, parameters, query))
    },
    replace: async <Path extends Paths>(
      path: Path,
      parameters?: ParameterValues<Path, Config>,
      query?: Query,
    ) => {
      await router.replace(buildPath(path, configuration, parameters, query))
    },
  }
}
