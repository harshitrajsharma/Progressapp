'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileQuestion } from 'lucide-react';
import { Shell } from '@/components/shell';

export default function DashboardNotFound() {
  return (
    <Shell>
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="max-w-md p-8 rounded-lg border bg-card text-center space-y-6">
          <div className="flex justify-center">
            <FileQuestion className="h-12 w-12 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">Page Not Found</h2>
            <p className="text-sm text-muted-foreground">
              Sorry, we couldn&apos;t find the dashboard page you&apos;re looking for.
            </p>
          </div>
          <div className="space-y-4">
            <Button
              variant="default"
              asChild
              className="w-full"
            >
              <Link href="/dashboard">
                Return to Dashboard
              </Link>
            </Button>
            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full"
            >
              Go Back
            </Button>
          </div>
        </div>
      </div>
    </Shell>
  );
} 