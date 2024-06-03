import type { AbstractAppEngine } from '../../ai/lib/BaseEngine'
import { OpenaiAssistantsEngine } from './OpenaiAssistantsEngine'

export const enginesRegistry: AbstractAppEngine[] = [
  new OpenaiAssistantsEngine(),
]
