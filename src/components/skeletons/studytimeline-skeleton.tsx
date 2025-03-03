import { Skeleton } from "@/components/ui/skeleton"

const StudyTimelineSkeleton = () => {
  return (
    <div className="w-full m-auto  p-2 sm:p-4 space-y-3 sm:space-y-4">

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
        {/* Calendar Section Skeleton */}
        <div className="space-y-3 sm:space-y-4">

          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
            <Skeleton className="h-6 sm:h-8 w-28 sm:w-32" />
          </div>

          {/* Study Streak Card Skeleton */}
          <div className="p-3 sm:p-4 border rounded-lg bg-card">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 sm:h-10 w-8 sm:w-10 rounded-full" />
              <div className="space-y-1 sm:space-y-2">
                <Skeleton className="h-4 sm:h-5 w-20 sm:w-24" />
                <Skeleton className="h-3 sm:h-4 w-32 sm:w-40" />
              </div>
            </div>
          </div>

          <div className="border rounded-lg p-3 sm:p-4 bg-card">
            <div className="space-y-2">
              <Skeleton className="h-5 sm:h-6 w-16 sm:w-20" />
              <Skeleton className="h-3 sm:h-4 w-28 sm:w-32" />
              <div className="mt-3 sm:mt-4 space-y-2">
                {/* Calendar Grid Skeleton */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                  {[...Array(7)].map((_, i) => (
                    <Skeleton key={`header-${i}`} className="h-6 sm:h-8 w-6 sm:w-8" />
                  ))}
                </div>
                {[...Array(5)].map((_, weekIndex) => (
                  <div key={`week-${weekIndex}`} className="grid grid-cols-7 gap-1 sm:gap-2">
                    {[...Array(7)].map((_, dayIndex) => (
                      <Skeleton
                        key={`day-${weekIndex}-${dayIndex}`}
                        className="h-6 sm:h-8 w-6 sm:w-8 rounded-md"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Section Skeleton */}
        <div className="lg:col-span-2">

          <div className=" flex justify-center mb-6">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 sm:h-6 w-5 sm:w-6 rounded-full" />
              <Skeleton className="h-5 sm:h-6 w-24 sm:w-32" />
              <Skeleton className="h-5 sm:h-6 w-5 sm:w-6 rounded-full" />
            </div>
          </div>

          {/* Tabs Skeleton */}
          <div className="grid grid-cols-2 sm:flex gap-2 mb-3 sm:mb-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={`tab-${i}`} className="h-8 sm:h-10 w-full sm:w-24 rounded-lg" />
            ))}
          </div>

          {/* Task Cards Skeleton */}
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={`task-${i}`} className="border rounded-lg p-3 sm:p-4 bg-card">
                <div className="flex items-center justify-between">
                  <div className="space-y-1 sm:space-y-2">
                    <Skeleton className="h-4 sm:h-5 w-28 sm:w-32" />
                    <Skeleton className="h-3 sm:h-4 w-20 sm:w-24" />
                  </div>
                  <Skeleton className="h-3 sm:h-4 w-14 sm:w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyTimelineSkeleton;