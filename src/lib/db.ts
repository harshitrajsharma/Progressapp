import { PrismaClient, Prisma } from "@prisma/client"
import { env } from "./env"

// Types
declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient | undefined
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
}

// Create Prisma Client with retry logic
function createPrismaClient() {
  const client = new PrismaClient(prismaConfig)

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

// Initialize database connection
function initializeDatabaseConnection() {
  if (env.NODE_ENV === 'production') {
    return createPrismaClient()
  }
  
  if (!global.cachedPrisma) {
    global.cachedPrisma = createPrismaClient()
  }
  
  return global.cachedPrisma
}

export const prisma = initializeDatabaseConnection()

// Export retry wrapper
export async function withRetry<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    if (retries > 0 && isRetryableError(error)) {
      console.warn(`Retrying operation. Attempts remaining: ${retries}`)
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (MAX_RETRIES - retries + 1)))
      return withRetry(operation, retries - 1)
    }
    throw error
  }
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const retryableCodes = ['P1001', 'P1002', 'P1008', 'P1013', 'P2010']
    return retryableCodes.includes(error.code)
  }
  
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase()
    return errorMessage.includes('connection') ||
           errorMessage.includes('timeout') ||
           errorMessage.includes('server selection') ||
           errorMessage.includes('network') ||
           error instanceof Prisma.PrismaClientRustPanicError ||
           error instanceof Prisma.PrismaClientInitializationError
  }
  
  return false
}

// Cleanup
const cleanup = async () => {
  await prisma.$disconnect()
}

process.on('beforeExit', cleanup)
process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
process.on('uncaughtException', cleanup)
process.on('unhandledRejection', cleanup)