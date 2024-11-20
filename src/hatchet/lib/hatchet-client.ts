import { env } from '@/env.mjs'
import { HatchetClient } from '@hatchet-dev/typescript-sdk/clients/hatchet-client'

let hatchetClientInstance: HatchetClient | null = null

export const getHatchetClient = () => {
  if (!hatchetClientInstance) {
    hatchetClientInstance = HatchetClient.init({
      token: env.HATCHET_CLIENT_TOKEN,
      api_url: env.HATCHET_API_URL,
      host_port: env.HATCHET_HOST_PORT,
      tls_config: {
        tls_strategy: 'none',
      },
    })
  }
  return hatchetClientInstance
}
