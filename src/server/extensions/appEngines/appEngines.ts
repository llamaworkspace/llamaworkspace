import type { AbstractAppEngine } from '../../ai/lib/AbstractAppEngine'
import { InternalAssistantsEngine } from './InternalAssistantsEngine'
import { OpenaiAssistantsEngine } from './OpenaiAssistantsEngine'

export const enginesRegistry: AbstractAppEngine[] = [
  new OpenaiAssistantsEngine(),
  new InternalAssistantsEngine(),
]
