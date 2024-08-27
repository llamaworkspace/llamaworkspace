import { env } from '@/env.mjs'
import type {
  ResolveEnvironmentVariablesFunction,
  TriggerConfig,
} from '@trigger.dev/sdk/v3'

//This runs when you run the deploy command or the dev command
export const resolveEnvVars: ResolveEnvironmentVariablesFunction = async ({
  //the project ref (starting with "proj_")
  projectRef,
  //any existing env vars from a .env file or Trigger.dev
  env,
  //"dev", "staging", or "prod"
  environment,
}) => {
  //the existing environment variables from Trigger.dev (or your local .env file)
  if (
    env.INFISICAL_CLIENT_ID === undefined ||
    env.INFISICAL_CLIENT_SECRET === undefined
  ) {
    //returning undefined won't modify the existing env vars
    return
  }

  const client = new InfisicalClient({
    clientId: env.INFISICAL_CLIENT_ID,
    clientSecret: env.INFISICAL_CLIENT_SECRET,
  })

  const secrets = await client.listSecrets({
    environment,
    projectId: env.INFISICAL_PROJECT_ID!,
  })

  return {
    variables: secrets.map((secret) => ({
      name: secret.secretKey,
      value: secret.secretValue,
    })),
    // this defaults to true
    // override: true,
  }
}
export const config: TriggerConfig = {
  project: env.TRIGGER_DOT_DEV_PROJECT_ID,
  logLevel: 'log',
  retries: {
    enabledInDev: false,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 20000,
      factor: 3,
      randomize: true,
    },
  },
  additionalPackages: ['prisma@5.3.1', 'husky@6.0.0'],
  additionalFiles: ['./prisma/schema.prisma'],
}
