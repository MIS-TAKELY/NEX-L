import { Skeleton } from "@/components/ui/skeleton";

const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="w-full bg-card rounded-md border border-border shadow-sm overflow-hidden premium-card">
      <div className="p-6 border-b border-border">
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="px-6 py-4 text-left">
                  <Skeleton className="h-3 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-6 py-5">
                    <Skeleton className="h-4 w-full max-w-[150px]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableSkeleton;
