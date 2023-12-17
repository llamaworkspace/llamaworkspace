import { type ParameterValues } from '../_routes/routes'
import { type DefaultConfiguration } from '../routes'

/// No variable end configuration
// Variables
undefined as unknown as {
  a: 1
  b: 1
} satisfies ParameterValues<'/:a/:b/c', DefaultConfiguration>

// No variables
undefined as unknown as {
  [K in string]: never
} satisfies ParameterValues<'/a/b/c', DefaultConfiguration>

// Repeated variable
undefined as unknown as {
  a: 1
} satisfies ParameterValues<'/:a/:a/c', DefaultConfiguration>

/// Variable end configuration
// Variables
undefined as unknown as {
  a: 1
  b: 1
} satisfies ParameterValues<
  '/[a]/[b]/c',
  {
    variableStart: '['
    variableEnd: ']'
  }
>

// No variables
undefined as unknown as {
  [K in string]: never
} satisfies ParameterValues<
  '/a/b/c',
  {
    variableStart: '['
    variableEnd: ']'
  }
>

// Repeated variable
undefined as unknown as {
  a: 1
} satisfies ParameterValues<
  '/[a]/[a]/c',
  {
    variableStart: '['
    variableEnd: ']'
  }
>
