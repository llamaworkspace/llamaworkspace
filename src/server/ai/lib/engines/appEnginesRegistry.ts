import type { AbstractAppEngine } from './AbstractAppEngine'
import { DefaultAppEngine } from './DefaultAppEngine'
import { ExternalAppEngine } from './ExternalAppEngine'
import { OpenaiAssistantsEngine } from './OpenaiAssistantsEngine'

export const appEnginesRegistry: AbstractAppEngine[] = [
  new ExternalAppEngine(),
  new DefaultAppEngine(),
  new OpenaiAssistantsEngine(),
]
