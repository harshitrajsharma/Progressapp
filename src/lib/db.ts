import { PrismaClient, Prisma } from "@prisma/client"
import { env } from "./env"

// Types
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Constants
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 second

// Configuration
const prismaConfig: Prisma.PrismaClientOptions = {
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'info', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ],
  datasources: {
    db: {
      url: env.DATABASE_URL
    }
  },
  // Connection pooling is handled by MongoDB driver
}

// Helper function for delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Create Prisma Client with retry logic
function createPrismaClient() {
  const client = new PrismaClient(prismaConfig)

  // Type-safe event handling
  client.$on('error' as never, (event: Prisma.LogEvent) => {
    console.error('[Database Error]:', event)
  })

  client.$on('warn' as never, (event: Prisma.LogEvent) => {
    console.warn('[Database Warning]:', event)
  })

  if (env.NODE_ENV === 'development') {
    client.$on('query' as never, (event: Prisma.QueryEvent) => {
      console.log('Query:', event.query)
      console.log('Duration:', `${event.duration}ms`)
      console.log('Timestamp:', event.timestamp)
    })
  }

  return client
}

// Retry wrapper for database operations
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      console.warn(`Retrying operation. Attempts remaining: ${retries}`)
      await delay(RETRY_DELAY * (MAX_RETRIES - retries + 1)) // Exponential backoff
      return withRetry(operation, retries - 1)
    }
    throw error
  }
}

// Helper to check if error is retryable
function isRetryableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Retryable error codes
    const retryableCodes = ['P1001', 'P1002', 'P1008', 'P1013']
    return retryableCodes.includes(error.code)
  }
  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return true
  }
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true
  }
  return false
}

// Initialize database connection
function initializeDatabaseConnection() {
  // In production, always create a new connection
  if (env.NODE_ENV === 'production') {
    return createPrismaClient()
  }
  
  // In development, reuse the connection
  if (!global.prisma) {
    global.prisma = createPrismaClient()
  }
  
  return global.prisma
}

// Export the prisma instance
export const prisma = initializeDatabaseConnection()

// Graceful shutdown handling
const handleShutdown = async () => {
  try {
    console.log('Closing database connection...')
    await prisma.$disconnect()
    console.log('Database connection closed.')
  } catch (error) {
    console.error('Error during database disconnection:', error)
    process.exit(1)
  }
}

// Register shutdown handlers
process.on('beforeExit', handleShutdown)
process.on('SIGINT', handleShutdown)
process.on('SIGTERM', handleShutdown)

// Handle unexpected errors
process.on('uncaughtException', async (error) => {
  console.error('[Uncaught Exception]:', error)
  await handleShutdown()
  process.exit(1)
})

process.on('unhandledRejection', async (error) => {
  console.error('[Unhandled Rejection]:', error)
  await handleShutdown()
  process.exit(1)
})