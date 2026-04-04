import { Skeleton } from "@/components/ui/skeleton";

const StudentDashboardSkeleton = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-12 pt-8">
      {/* Middle Column - Main Content */}
      <div className="flex-1 flex flex-col gap-12">
        {/* Banner Section Skeleton */}
        <div className="bg-primary/5 rounded-md p-10 md:p-12 relative overflow-hidden border border-primary/10">
          <div className="relative z-10 max-w-xl space-y-6">
            <Skeleton className="h-4 w-32 bg-primary/10" />
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-2/3" />
            </div>
            <Skeleton className="h-12 w-48 rounded-md" />
          </div>
        </div>

        {/* Course Progress Highlights Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-card p-6 rounded-md border border-border flex items-center justify-between premium-card">
              <div className="flex items-center gap-4">
                <Skeleton className="w-12 h-12 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-2 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="w-5 h-5" />
            </div>
          ))}
        </div>

        {/* Featured / Continue Section Skeleton */}
        <div>
          <div className="flex justify-between items-end mb-10">
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-1 w-12" />
            </div>
            <div className="flex gap-4">
              <Skeleton className="w-10 h-10 rounded-md" />
              <Skeleton className="w-10 h-10 rounded-md" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[1, 2].map((i) => (
              <div key={i} className="bg-card p-6 rounded-md border border-border premium-card">
                <Skeleton className="h-48 rounded-md mb-6" />
                <div className="space-y-4">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-8 w-full" />
                  <div className="flex items-center justify-between pt-6 border-t border-border">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-md" />
                      <div className="space-y-2">
                        <Skeleton className="h-3 w-24" />
                        <Skeleton className="h-2 w-16" />
                      </div>
                    </div>
                    <Skeleton className="w-6 h-6 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar Skeleton */}
      <div className="w-full lg:w-96 flex flex-col gap-12 lg:sticky lg:top-32 h-fit">
        {/* Profile Card Skeleton */}
        <div className="bg-card rounded-md p-8 border border-border premium-card flex flex-col items-center">
          <Skeleton className="w-28 h-28 rounded-md p-2 mb-8" />
          <Skeleton className="h-8 w-48 mb-4" />
          <div className="space-y-2 w-full flex flex-col items-center">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        </div>

        {/* Badges Widget Skeleton */}
        <div className="px-2">
          <div className="flex justify-between items-center mb-8 px-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-3 w-16" />
          </div>
          <div className="bg-card rounded-md p-6 border border-border premium-card">
            <div className="flex gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="w-14 h-14 rounded-md" />
              ))}
            </div>
          </div>
        </div>

        {/* Mentors Section Skeleton */}
        <div className="px-2">
          <div className="flex justify-between items-center mb-8 px-4">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="w-10 h-10 rounded-md" />
          </div>
          <div className="bg-card rounded-md p-8 border border-border space-y-8 premium-card">
            {[1, 2].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-14 h-14 rounded-md" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-2 w-16" />
                  </div>
                </div>
                <Skeleton className="w-10 h-10 rounded-md" />
              </div>
            ))}
            <Skeleton className="w-full h-12 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboardSkeleton;
