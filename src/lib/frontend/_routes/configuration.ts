export type Configuration = { variableStart: string; variableEnd: string }

export type DefaultConfiguration = {
  variableStart: ':'
  variableEnd: ''
}

export const defaultConfiguration: DefaultConfiguration = Object.freeze({
  variableStart: ':',
  variableEnd: '',
})
