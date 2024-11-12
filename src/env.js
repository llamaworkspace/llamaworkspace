import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    AUTH_SECRET:
      process.env.NODE_ENV === "production"
        ? z.string()
        : z.string().optional(),
    SMTP_EMAIL_FROM: z.string(),
    SMTP_EMAIL_SERVER: z.string(),
    DATABASE_URL: z.string().url(),
    HATCHET_CLIENT_TOKEN: z.string(),
    HATCHET_API_URL: z.string().url(),
    HATCHET_HOST_PORT: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    AUTH_SECRET: process.env.AUTH_SECRET,
    SMTP_EMAIL_FROM: process.env.SMTP_EMAIL_FROM,
    SMTP_EMAIL_SERVER: process.env.SMTP_EMAIL_SERVER,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    HATCHET_CLIENT_TOKEN: process.env.HATCHET_CLIENT_TOKEN,
    HATCHET_CLIENT_TLS_STRATEGY: process.env.HATCHET_CLIENT_TLS_STRATEGY,
    HATCHET_API_URL: process.env.HATCHET_API_URL,
    HATCHET_HOST_PORT: process.env.HATCHET_HOST_PORT,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
