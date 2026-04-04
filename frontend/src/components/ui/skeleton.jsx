import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-muted/40 relative overflow-hidden rounded-md",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:skeleton-shimmer",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
