import { Skeleton } from "@/components/ui/skeleton";

const CourseSkeleton = () => {
    return (
        <div className="h-full flex flex-col bg-card/60 rounded-xl border border-border/50 overflow-hidden glass-card premium-card">
            <Skeleton className="relative aspect-[16/9] w-full" />

            <div className="flex-1 flex flex-col p-4">
                <Skeleton className="h-4 w-full mb-1.5" />
                <Skeleton className="h-4 w-2/3 mb-3" />

                <Skeleton className="h-3 w-full mb-2" />
                <Skeleton className="h-3 w-4/5 mb-4" />

                <div className="mt-auto space-y-3">
                    <div className="flex items-center justify-between">
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-3 w-8" />
                    </div>
                    <Skeleton className="h-2 w-full rounded-full" />

                    <div className="flex items-center gap-2 pt-1">
                        <Skeleton className="w-7 h-7 rounded-full flex-shrink-0" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                </div>
            </div>

            <div className="flex gap-2 p-4 pt-0">
                <Skeleton className="h-9 flex-1 rounded-lg" />
                <Skeleton className="h-9 flex-1 rounded-lg" />
            </div>
        </div>
    );
};

export default CourseSkeleton;
