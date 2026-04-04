import { Skeleton } from "@/components/ui/skeleton";

const CourseSkeleton = () => {
    return (
        <div className="h-full flex flex-col bg-card rounded-md border border-border p-5 overflow-hidden glass-card max-w-[280px] mx-auto w-full premium-card">
            {/* Thumbnail Skeleton */}
            <Skeleton className="relative aspect-[4/3] mb-5 overflow-hidden rounded-md w-full" />

            <div className="flex-1 flex flex-col">
                {/* Category Badge Skeleton */}
                <Skeleton className="h-3 rounded-md w-16 mb-3" />

                {/* Title Skeleton */}
                <Skeleton className="h-6 rounded-md w-full mb-1.5" />
                <Skeleton className="h-6 rounded-md w-2/3 mb-4" />

                {/* Instructor Skeleton */}
                <div className="flex items-center gap-1.5 mb-4">
                    <Skeleton className="w-5 h-5 rounded-md" />
                    <Skeleton className="h-2.5 rounded-md w-20" />
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-3 gap-1 py-3 border-y border-border/50 mb-4">
                    <div className="flex flex-col items-center gap-1.5 border-r border-border/50">
                        <Skeleton className="h-2.5 rounded w-8" />
                        <Skeleton className="h-1.5 rounded w-6" />
                    </div>
                    <div className="flex flex-col items-center gap-1.5 border-r border-border/50">
                        <Skeleton className="h-2.5 rounded w-8" />
                        <Skeleton className="h-1.5 rounded w-6" />
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                        <Skeleton className="h-2.5 rounded w-8" />
                        <Skeleton className="h-1.5 rounded w-6" />
                    </div>
                </div>

                {/* Footer Skeleton */}
                <div className="mt-auto flex items-center justify-between">
                    <div className="space-y-1">
                        <Skeleton className="h-1.5 rounded w-6" />
                        <Skeleton className="h-5 rounded w-16" />
                    </div>
                    <Skeleton className="h-9 w-9 rounded-md" />
                </div>
            </div>
        </div>
    );
};

export default CourseSkeleton;
