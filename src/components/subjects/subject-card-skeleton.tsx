'use client';

import { Card } from "@/components/ui/card";

export function SubjectCardSkeleton() {
  return (
    <Card className="p-3 sm:p-4 hover:shadow-md transition-all relative">
      <div className="space-y-3 sm:space-y-4">
        {/* Header */}
        <div className="space-y-2 sm:space-y-3">
          {/* Subject Name and Progress Badge */}
          <div className="flex items-center justify-between">
            <div className="h-7 w-48 bg-muted animate-pulse rounded" />
            <div className="h-5 w-12 bg-muted animate-pulse rounded-full" />
          </div>
          
          {/* Subject Info */}
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
            <div className="h-4 w-16 bg-muted animate-pulse rounded" />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {/* Expected Score */}
          <div className="relative bg-muted/5 rounded-lg sm:rounded-xl overflow-hidden animate-pulse">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 sm:w-1 bg-muted" />
            <div className="p-2 sm:p-2.5 space-y-2">
              <div className="h-3 w-16 bg-muted rounded" />
              <div className="h-5 w-12 bg-muted rounded" />
            </div>
          </div>

          {/* Foundation Level */}
          <div className="relative bg-muted/5 rounded-lg sm:rounded-xl overflow-hidden animate-pulse">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 sm:w-1 bg-muted" />
            <div className="p-2 sm:p-2.5 space-y-2">
              <div className="h-3 w-16 bg-muted rounded" />
              <div className="h-5 w-20 bg-muted rounded" />
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-2 sm:space-y-3">
          {/* Overall Progress */}
          <div className="space-y-1 sm:space-y-1.5">
            <div className="flex justify-between items-center">
              <div className="h-3 w-24 bg-muted animate-pulse rounded" />
              <div className="h-3 w-8 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-2 bg-muted animate-pulse rounded" />
          </div>

          {/* Detailed Progress */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between">
                  <div className="h-2.5 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-2.5 w-8 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-1.5 bg-muted animate-pulse rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
} 