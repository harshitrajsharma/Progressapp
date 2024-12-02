'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle, RefreshCcw } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset?: () => void
  children?: React.ReactNode
}

export default function ErrorBoundary({
  error,
  reset,
  children
}: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Error:', error)
  }, [error])

  // Safely get error message
  const errorMessage = error?.message || 'An unknown error occurred'

  const isConnectionError = 
    typeof errorMessage === 'string' && (
      errorMessage.includes('Server selection timeout') ||
      errorMessage.includes('Connection refused') ||
      errorMessage.includes('ECONNREFUSED')
    )

  const isAuthError = 
    typeof errorMessage === 'string' && (
      errorMessage.includes('Authentication') ||
      errorMessage.includes('Unauthorized') ||
      errorMessage.includes('not authenticated')
    )

  let title = 'Something went wrong!'
  let description = 'An unexpected error occurred while loading the page.'

  if (isConnectionError) {
    title = 'Connection Error'
    description = 'We are having trouble connecting to our servers. This might be due to network issues or server maintenance.'
  } else if (isAuthError) {
    title = 'Authentication Error'
    description = 'Please sign in again to continue.'
  }

  const handleReset = () => {
    if (reset) {
      reset()
    } else {
      // Fallback to page refresh if no reset function provided
      window.location.reload()
    }
  }

  if (!error) {
    return children || null
  }

  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="max-w-md w-full space-y-4">
        <Alert variant="destructive" className="border-destructive/50">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>{title}</AlertTitle>
          <AlertDescription>
            {description}
            {!isConnectionError && !isAuthError && (
              <div className="mt-2 text-xs opacity-70">
                Error: {errorMessage}
              </div>
            )}
          </AlertDescription>
        </Alert>
        
        <div className="flex flex-col sm:flex-row justify-center gap-2">
          <Button
            onClick={handleReset}
            className="gap-2 w-full sm:w-auto"
            variant={isAuthError ? "outline" : "default"}
          >
            <RefreshCcw className="h-4 w-4" />
            Try Again
          </Button>
          {isAuthError && (
            <Button
              onClick={() => window.location.href = '/auth/signin'}
              className="gap-2 w-full sm:w-auto"
            >
              Sign In
            </Button>
          )}
        </div>

        {isConnectionError && (
          <p className="text-sm text-muted-foreground text-center">
            If the problem persists, please try again in a few minutes or contact support.
          </p>
        )}
      </div>
    </div>
  )
} 