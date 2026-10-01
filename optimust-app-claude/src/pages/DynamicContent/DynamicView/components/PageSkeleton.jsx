import { Skeleton } from "primereact/skeleton";

const PageSkeleton = () => {
  return (
    <div className="grid gap-3 overflow-auto max-h-[calc(100vh-104px)] pr-4">
      
      {/* 🔷 Top Panel Skeleton */}
      <div className="bg-white rounded-xl p-4 shadow-sm">
        {/* Title */}
        <Skeleton width="250px" height="20px" className="mb-3" />

        {/* Key Value Grid */}
        <div className="grid grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <Skeleton width="80px" height="12px" className="mb-1" />
              <Skeleton width="100%" height="16px" />
            </div>
          ))}
        </div>
      </div>

      {/* 🔷 Section */}
      <section className="flex-1 min-w-0 rounded-t-3xl">
        
        {/* Header */}
        <div className="flex justify-between items-center px-2 pb-2">
          <Skeleton width="180px" height="18px" />
          
          <div className="flex gap-2">
            <Skeleton width="80px" height="32px" borderRadius="6px" />
            <Skeleton width="80px" height="32px" borderRadius="6px" />
          </div>
        </div>

        {/* Content Card */}
        <div className="h-[calc(100vh-143px)] shadow-md rounded-t-3xl p-2 overflow-y-auto">
          
          {/* Simulated Content Blocks */}
          <div className="grid gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="p-3 rounded-lg">
                <Skeleton width="40%" height="14px" className="mb-2" />
                <Skeleton width="100%" height="12px" className="mb-1" />
                <Skeleton width="90%" height="12px" />
              </div>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
};

export default PageSkeleton;