import { Skeleton } from "primereact/skeleton";

export const NoTabSkeleton = (colSize) => (
  <div className={`grid grid-cols-${colSize || 3} gap-3 p-3`}>
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="flex flex-col gap-2">
        <Skeleton width="40%" height="14px" />
        <Skeleton width="100%" height="30px" />
      </div>
    ))}
  </div>
);
