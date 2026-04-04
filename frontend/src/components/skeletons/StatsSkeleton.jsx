import { Skeleton } from "@/components/ui/skeleton";

const StatsSkeleton = () => {
  return (
    <div className="bg-card rounded-md p-6 border border-border shadow-sm relative overflow-hidden premium-card">
      <div className="p-3 rounded-md w-fit mb-4 bg-muted/20">
        <Skeleton className="w-6 h-6" />
      </div>
      <Skeleton className="h-3 w-24 mb-3" />
      <Skeleton className="h-8 w-20" />
    </div>
  );
};

export default StatsSkeleton;
