'use client'

import * as React from "react"
import { AlertCircle, Database, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface DatabaseStatusProps {
  isLoading: boolean
  isError: boolean
  isCached: boolean
  className?: string
}

export function DatabaseStatus({ 
  isLoading, 
  isError, 
  isCached,
  className 
}: DatabaseStatusProps) {
  const { toast } = useToast()

  React.useEffect(() => {
    if (isCached) {
      toast({
        title: "Using Cached Data",
        description: "Currently showing cached data. Will update when database connection is restored.",
        variant: "default",
      })
    }
  }, [isCached, toast])

  if (!isLoading && !isError && !isCached) return null

  return (
    <Alert 
      variant={isError ? "destructive" : "default"} 
      className={className}
    >
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isError ? (
          <AlertCircle className="h-4 w-4" />
        ) : (
          <Database className="h-4 w-4" />
        )}
        <AlertDescription>
          {isLoading 
            ? "Connecting to database..." 
            : isError 
            ? "Database connection failed. Using cached data." 
            : "Using cached data"}
        </AlertDescription>
      </div>
    </Alert>
  )
} 