import { Skeleton } from "@/components/ui/skeleton";

const DashboardSkeleton = () => {
  return (
    <div className="space-y-8 font-outfit text-foreground">
      {/* Top Stats Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Visits Card Skeleton */}
        <div className="lg:col-span-2 bg-gradient-to-br from-primary/80 to-accent/80 rounded-md p-8 min-h-[300px] flex flex-col justify-center relative overflow-hidden premium-card">
          <div className="relative z-10 w-full md:w-1/2 space-y-4">
            <Skeleton className="h-4 w-32 bg-white/20" />
            <Skeleton className="h-16 w-24 bg-white/20" />
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded bg-white/10" />
                <div className="space-y-2">
                  <Skeleton className="h-2 w-16 bg-white/10" />
                  <Skeleton className="h-4 w-12 bg-white/10" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Skeleton className="w-8 h-8 rounded bg-white/10" />
                <div className="space-y-2">
                  <Skeleton className="h-2 w-16 bg-white/10" />
                  <Skeleton className="h-4 w-12 bg-white/10" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popularity Rate Card Skeleton */}
        <div className="bg-card rounded-md p-8 relative flex flex-col justify-between premium-card border border-border">
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-10" />
            </div>
            <Skeleton className="h-16 w-40" />
          </div>
          <div className="mt-8 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        </div>
      </div>

      {/* Bottom Section Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Finance Performance Skeleton */}
        <div className="bg-card rounded-md p-8 shadow-sm premium-card border border-border">
          <Skeleton className="h-6 w-48 mb-6" />
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-md" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          </div>
          <div className="flex justify-between items-end h-32 px-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex flex-col items-center gap-2 w-full">
                <div className="h-24 w-full flex items-end justify-center">
                  <Skeleton className="w-2 rounded-md" style={{ height: `${Math.random() * 50 + 30}%` }} />
                </div>
                <Skeleton className="h-2 w-6" />
              </div>
            ))}
          </div>
        </div>

        {/* Top Performers Skeleton */}
        <div className="bg-card rounded-md p-8 shadow-sm premium-card border border-border">
          <Skeleton className="h-4 w-32 mb-6" />
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-md" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <div className="space-y-2 text-right">
                  <Skeleton className="h-4 w-12 ml-auto" />
                  <Skeleton className="h-1.5 w-16 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;
