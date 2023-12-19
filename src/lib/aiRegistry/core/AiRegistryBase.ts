export interface IModel {
  readonly slug: string
  readonly publicName: string
}

export interface IProvider {
  readonly slug: string
  readonly publicName: string
  readonly models: IModel[]
  execute(args: unknown): unknown
}

export abstract class AbstractModel {
  abstract execute(): void
}
export abstract class AbstractProvider {
  constructor(public readonly models: AbstractModel[]) {}
}
