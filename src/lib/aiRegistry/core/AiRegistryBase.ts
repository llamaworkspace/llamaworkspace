export interface IModel {
  readonly slug: string
  readonly publicName: string
}

export interface IProvider<T, U> {
  readonly slug: string
  readonly publicName: string
  readonly models: IModel[]
  execute(payload: T, options: U): Promise<ReadableStream>
}

export abstract class AbstractModel {
  abstract execute(): void
}
export abstract class AbstractProvider {
  constructor(public readonly models: AbstractModel[]) {}
}
