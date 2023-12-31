import type { Configuration } from './configuration'

type RouteParams<
  Paths extends string,
  Config extends Configuration,
  Head extends string[] = [],
> = Paths extends `${Config['variableStart']}${infer Variable}${Config['variableEnd']}/${infer Rest}`
  ? [...Head, Variable, ...RouteParams<Rest, Config>]
  : Paths extends `${Config['variableStart']}${infer Variable}${Config['variableEnd']}`
    ? [...Head, Variable]
    : Paths extends `${string}/${infer Rest}`
      ? [...Head, ...RouteParams<Rest, Config>]
      : Head

export type ParameterValues<
  Paths extends string,
  Config extends Configuration,
> = RouteParams<Paths, Config> extends [string, ...string[]]
  ? Record<RouteParams<Paths, Config>[number], string | number>
  : { [K in string]: never }

export type Query = Record<string, string | number | boolean>

export type Route<
  Paths extends string,
  Config extends Configuration,
> = RouteParams<Paths, Config> extends [string, ...string[]]
  ? {
      buildPath: <Path extends Paths>(
        path: Path,
        parameters: ParameterValues<Path, Config>,
        query?: Query,
      ) => string
      push: <Path extends Paths>(
        path: Path,
        parameters: ParameterValues<Path, Config>,
        query?: Query,
      ) => Promise<void>
      replace: <Path extends Paths>(
        path: Path,
        parameters: ParameterValues<Path, Config>,
        query?: Query,
      ) => Promise<void>
    }
  : {
      buildPath: <Path extends Paths>(
        path: Path,
        parameters?: ParameterValues<Path, Config>,
        query?: Query,
      ) => string
      push: <Path extends Paths>(
        path: Path,
        parameters?: ParameterValues<Path, Config>,
        query?: Query,
      ) => Promise<void>
      replace: <Path extends Paths>(
        path: Path,
        parameters?: ParameterValues<Path, Config>,
        query?: Query,
      ) => Promise<void>
    }
