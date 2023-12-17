import { type Route } from '../_routes/routes'
import { type DefaultConfiguration, type makeNavigation } from '../routes'

// Correct route
type CorrectRoutePaths = '/a/b/c' | '/:a/:b/c'
undefined as unknown as ReturnType<
  typeof makeNavigation<CorrectRoutePaths, DefaultConfiguration>
> satisfies Route<CorrectRoutePaths, DefaultConfiguration>

// Incorrect route
type IncorrectRoutePaths = '/a/b/c' | '/:a/:/c'
undefined as unknown as Route<never, DefaultConfiguration> satisfies ReturnType<
  typeof makeNavigation<IncorrectRoutePaths, DefaultConfiguration>
>
