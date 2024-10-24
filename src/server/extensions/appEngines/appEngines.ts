import { DefaultAppEngine } from '@/server/ai/lib/DefaultAppEngine'
import { ExternalAppEngine } from '@/server/ai/lib/ExternalAppEngine'
import type { AbstractAppEngine } from '../../ai/lib/AbstractAppEngine'
import { OpenaiAssistantsEngine } from './OpenaiAssistantsEngine'

export const enginesRegistry: AbstractAppEngine[] = [
  new ExternalAppEngine(),
  new DefaultAppEngine(),
  new OpenaiAssistantsEngine(),
]
