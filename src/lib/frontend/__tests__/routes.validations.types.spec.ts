import {
  type Configuration,
  type DefaultConfiguration,
  type PathErrors,
} from '../routes'

// Helper
type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never

// A intersection of the errors. If it contains more than 1 error, it will be never.
// This allows us to test that there's exactly one error in each case.
type IntersectionPathErrors<
  Paths extends string,
  Config extends Configuration,
> = UnionToIntersection<PathErrors<Paths, Config>>

// ValidateVariableStartNotEmpty
"Variable start '' is empty" satisfies IntersectionPathErrors<
  never,
  {
    variableStart: ''
    variableEnd: ''
  }
>

// ValidateVariableStartNoSlashes
"Variable start '/' contains slashes" satisfies IntersectionPathErrors<
  never,
  {
    variableStart: '/'
    variableEnd: ''
  }
>

// ValidateVariableEndNoSlashes
"Variable end '/' contains slashes" satisfies IntersectionPathErrors<
  never,
  {
    variableStart: ':'
    variableEnd: '/'
  }
>

// ValidatePathNoEmptyVariables
"Path '/a/:' contains empty variables" satisfies IntersectionPathErrors<
  '/a/:' | '/a/:b',
  DefaultConfiguration
>
"Path '/a/:/' contains empty variables" satisfies IntersectionPathErrors<
  '/a/:/' | '/a/:b',
  DefaultConfiguration
>

// ValidatePathNoDoubleSlashes
"Path '/a//:b' contains double slashes" satisfies IntersectionPathErrors<
  '/a//:b' | '/a/:b',
  DefaultConfiguration
>
