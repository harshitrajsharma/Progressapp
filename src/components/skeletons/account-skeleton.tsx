import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function AccountPageSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[180px]" />
        <Skeleton className="h-4 w-[300px]" />
      </div>

      {/* Profile Section */}
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-[150px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </Card>

      {/* Exam Details Section */}
      <Card className="p-6">
        <div className="space-y-6">
          <Skeleton className="h-6 w-[120px]" />
          <div className="grid gap-4 md:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </Card>

      {/* Account Settings Section */}
      <Card className="p-6">
        <div className="space-y-6">
          <Skeleton className="h-6 w-[140px]" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </Card>
    </div>
  );
} 