'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Shell } from '@/components/shell';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <Shell>
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="max-w-md p-8 rounded-lg border bg-card text-center space-y-6">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Dashboard Error</h2>
            <p className="text-sm text-muted-foreground">
              There was a problem loading your dashboard. This could be due to a temporary issue or connection problem.
            </p>
          </div>
          <div className="space-y-4">
            <Button
              variant="default"
              onClick={() => reset()}
              className="w-full"
            >
              Retry Loading
            </Button>
            <Button
              variant="outline"
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Refresh Page
            </Button>
          </div>
        </div>
      </div>
    </Shell>
  );
} 