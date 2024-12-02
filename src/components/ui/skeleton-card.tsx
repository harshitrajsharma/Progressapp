'use client'

import { Card } from "./card"

export function SubjectCardSkeleton() {
  return (
    <Card className="relative overflow-hidden">
      <div className="p-3 sm:p-5 space-y-4">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
            <div className="h-6 w-12 bg-muted animate-pulse rounded-full" />
          </div>
          <div className="h-4 w-48 bg-muted animate-pulse rounded" />
        </div>

        {/* Info Boxes */}
        <div className="grid grid-cols-2 gap-2">
          <div className="h-16 bg-muted animate-pulse rounded-lg" />
          <div className="h-16 bg-muted animate-pulse rounded-lg" />
        </div>

        {/* Progress Bars */}
        <div>
          <div className="mb-4">
            <div className="flex justify-between mb-1.5">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-12 bg-muted animate-pulse rounded" />
            </div>
            <div className="h-2.5 bg-muted animate-pulse rounded-full" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-8 bg-muted animate-pulse rounded" />
                </div>
                <div className="h-1.5 bg-muted animate-pulse rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

export function SubjectDetailsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="h-4 w-32 bg-muted animate-pulse rounded" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>

      {/* Progress Section */}
      <div className="space-y-4">
        <div className="h-6 w-32 bg-muted animate-pulse rounded" />
        <div className="grid gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}