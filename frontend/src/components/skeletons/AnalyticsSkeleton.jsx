import { Skeleton } from "@/components/ui/skeleton";
import StatsSkeleton from "./StatsSkeleton";
import TableSkeleton from "./TableSkeleton";

const AnalyticsSkeleton = () => {
  return (
    <div className="bg-background text-foreground p-6 md:p-10 min-h-screen font-sans border-0 w-full">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 md:h-12" />
          <Skeleton className="h-4 w-96 max-w-full" />
        </div>
      </div>

      {/* Overview Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <StatsSkeleton key={i} />
        ))}
      </div>

      {/* Course Performance Table */}
      <div className="max-w-7xl mx-auto">
        <TableSkeleton rows={5} columns={5} />
      </div>
    </div>
  );
};

export default AnalyticsSkeleton;
