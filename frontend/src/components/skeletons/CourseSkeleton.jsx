const CourseSkeleton = () => {
    return (
        <div className="h-full flex flex-col bg-card rounded-xl border border-border p-5 animate-pulse overflow-hidden glass-card max-w-[280px] mx-auto w-full">
            {/* Thumbnail Skeleton */}
            <div className="relative aspect-[4/3] mb-5 overflow-hidden rounded-xl bg-muted"></div>

            <div className="flex-1 flex flex-col">
                {/* Category Badge Skeleton */}
                <div className="h-3 bg-muted/70 rounded-full w-16 mb-3 px-3"></div>

                {/* Title Skeleton */}
                <div className="h-6 bg-muted rounded-lg w-full mb-1.5"></div>
                <div className="h-6 bg-muted rounded-lg w-2/3 mb-4"></div>

                {/* Instructor Skeleton */}
                <div className="flex items-center gap-1.5 mb-4">
                    <div className="w-5 h-5 rounded-full bg-muted"></div>
                    <div className="h-2.5 bg-muted/50 rounded-lg w-20"></div>
                </div>

                {/* Stats Grid Skeleton */}
                <div className="grid grid-cols-3 gap-1 py-3 border-y border-border/50 mb-4">
                    <div className="flex flex-col items-center gap-1.5 border-r border-border/50">
                        <div className="h-2.5 bg-muted/70 rounded w-8"></div>
                        <div className="h-1.5 bg-muted/30 rounded w-6"></div>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 border-r border-border/50">
                        <div className="h-2.5 bg-muted/70 rounded w-8"></div>
                        <div className="h-1.5 bg-muted/30 rounded w-6"></div>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                        <div className="h-2.5 bg-muted/70 rounded w-8"></div>
                        <div className="h-1.5 bg-muted/30 rounded w-6"></div>
                    </div>
                </div>

                {/* Footer Skeleton */}
                <div className="mt-auto flex items-center justify-between">
                    <div className="space-y-1">
                        <div className="h-1.5 bg-muted/30 rounded w-6"></div>
                        <div className="h-5 bg-muted rounded w-16"></div>
                    </div>
                    <div className="h-9 w-9 bg-muted rounded-xl"></div>
                </div>
            </div>
        </div>
    );
};

export default CourseSkeleton;
