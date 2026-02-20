const CourseSkeleton = () => {
    return (
        <div className="h-full flex flex-col bg-white dark:bg-zinc-900 rounded-[2rem] border-2 border-gray-100 dark:border-zinc-800 p-4 animate-pulse">
            {/* Thumbnail Skeleton */}
            <div className="relative h-48 mb-4 overflow-hidden rounded-2xl bg-gray-200 dark:bg-zinc-800"></div>

            <div className="flex-1 flex flex-col">
                {/* Title Skeleton */}
                <div className="h-7 bg-gray-200 dark:bg-zinc-800 rounded-lg w-3/4 mb-4"></div>

                {/* Description Skeleton */}
                <div className="space-y-2 mb-6">
                    <div className="h-4 bg-gray-100 dark:bg-zinc-800/50 rounded-lg w-full"></div>
                    <div className="h-4 bg-gray-100 dark:bg-zinc-800/50 rounded-lg w-5/6"></div>
                </div>

                {/* Footer Skeleton */}
                <div className="mt-auto flex items-center justify-between">
                    <div className="space-y-2">
                        <div className="h-3 bg-gray-100 dark:bg-zinc-800/50 rounded-lg w-16"></div>
                        <div className="h-4 bg-gray-200 dark:bg-zinc-800 rounded-lg w-24"></div>
                    </div>
                    <div className="text-right space-y-2">
                        <div className="h-3 bg-gray-100 dark:bg-zinc-800/50 rounded-lg w-12 ml-auto"></div>
                        <div className="h-6 bg-gray-200 dark:bg-zinc-800 rounded-lg w-20 ml-auto"></div>
                    </div>
                </div>
            </div>

            {/* Button Skeleton */}
            <div className="mt-6 flex gap-3">
                <div className="flex-1 h-12 bg-gray-200 dark:bg-zinc-800 rounded-xl"></div>
                <div className="w-12 h-12 bg-gray-200 dark:bg-zinc-800 rounded-xl"></div>
            </div>
        </div>
    );
};

export default CourseSkeleton;
