'use client'

import ErrorBoundary from "@/components/error-boundary"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen bg-background">
          <ErrorBoundary error={error} reset={reset} />
        </div>
      </body>
    </html>
  )
} 