import type { BaseAppEngine } from './BaseEngine'
import { OpenaiAssistantsEngine } from './OpenaiAssistantsEngine'

export const enginesRegistry: BaseAppEngine[] = [
  new OpenaiAssistantsEngine(),
  // Add more engines here
]

const engineMap: Record<string, BaseAppEngine> = {}

enginesRegistry.forEach((engine) => {
  engineMap[engine.getName()] = engine
})

export function getEngineByName(name: string): BaseAppEngine | undefined {
  return engineMap[name]
}

export function getAllEngineNames(): string[] {
  return Object.keys(engineMap)
}
