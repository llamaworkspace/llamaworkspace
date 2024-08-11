import { TriggerClient } from '@trigger.dev/sdk'

const TRIGGER_API_KEY = process.env.TRIGGER_API_KEY
const TRIGGER_API_URL = 'https://api.trigger.dev'

export const client = new TriggerClient({
  id: 'llama-workspace-HaV2',
  apiKey: TRIGGER_API_KEY,
  apiUrl: TRIGGER_API_URL,
})
