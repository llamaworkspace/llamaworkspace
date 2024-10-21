export class GenericRegistry<T extends { name: string }> {
  constructor(private items: Map<string, T> = new Map()) {}

  register(item: T): void {
    this.items.set(item.name, item)
  }

  get(name: string): T | undefined {
    return this.items.get(name)
  }

  getOrThrow(name: string): T {
    const item = this.get(name)
    if (!item) {
      throw new Error(`Could not find ${name} in registry`)
    }
    return item
  }

  getAll(): T[] {
    return Array.from(this.items.values())
  }
}
