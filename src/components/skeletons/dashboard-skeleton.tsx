import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Days Until */}
        <div className="rounded-lg border bg-card p-6">
          <Skeleton className="h-12 w-[100px] mb-4" />
          <Skeleton className="h-4 w-[150px]" />
        </div>

        {/* Subject Progress */}
        <div className="rounded-lg border bg-card p-6">
          <Skeleton className="h-12 w-[80px] mb-4" />
          <Skeleton className="h-4 w-[120px]" />
        </div>

        {/* Projected Marks */}
        <div className="rounded-lg border bg-card p-6">
          <Skeleton className="h-12 w-[90px] mb-4" />
          <Skeleton className="h-4 w-[130px]" />
        </div>
      </div>

      {/* Calendar Section */}
      <div className="rounded-lg border bg-card p-6">
        <Skeleton className="h-[300px] w-full" />
      </div>

      {/* Progress Section */}
      <div className="rounded-lg border bg-card p-6 space-y-4">
        <Skeleton className="h-6 w-[150px]" />
        <Skeleton className="h-4 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>

      {/* Topic Weightage Graph */}
      <div className="rounded-lg border bg-card p-6">
        <Skeleton className="h-[200px] w-full" />
      </div>
    </div>
  );
} 