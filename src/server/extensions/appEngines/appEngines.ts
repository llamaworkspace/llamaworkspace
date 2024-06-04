import type { AbstractAppEngine } from '../../ai/lib/BaseEngine'
import { OpenaiAssistantsEngine } from './OpenaiAssistantsEngine'
import { OpenaiBasicEngine } from './OpenaiBasicEngine'

export const enginesRegistry: AbstractAppEngine[] = [
  new OpenaiAssistantsEngine(),
  new OpenaiBasicEngine(),
]
