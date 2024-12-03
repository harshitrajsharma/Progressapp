import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  DB_HOST: z.string(),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_NAME: z.string(),
  DB_CONNECTION_LIMIT: z.string().transform(Number),
  DB_POOL_MIN: z.string().transform(Number),
  DB_POOL_MAX: z.string().transform(Number),
  DB_TIMEOUT: z.string().transform(Number),

  // Auth
  NEXTAUTH_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),

  // App
  NODE_ENV: z.enum(['development', 'production', 'test']),
  APP_URL: z.string().url(),
  API_TIMEOUT: z.string().transform(Number),
})

// Validate environment variables
function validateEnv() {
  try {
    return envSchema.parse(process.env)
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error(
        'Invalid environment variables:',
        JSON.stringify(error.flatten().fieldErrors, null, 2)
      )
    }
    throw new Error('Invalid environment variables')
  }
}

export const env = validateEnv()

// Type inference
type Env = z.infer<typeof envSchema>

// eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
} 