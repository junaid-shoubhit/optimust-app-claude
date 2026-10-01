import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";

const TemplateSkeleton = () => {
  return (
    <Card
      className="bg-(--foreground) w-full overflow-y-auto relative"
      style={{ height: "calc(100vh - 5.99rem)" }}
    >
      <div className="h-full p-3 flex flex-col gap-3">
        {/* Header skeleton */}
        <div className="flex justify-between items-center border-b pb-2 mb-3">
          <Skeleton width="40%" height="1.5rem" />
          <div className="flex gap-2">
            <Skeleton width="6rem" height="2rem" />
            <Skeleton width="6rem" height="2rem" />
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-3 grow">
          {/* Editor section */}
          <div className="lg:col-span-5 flex flex-col gap-2">
            <Skeleton width="100%" height="2rem" className="mb-2" />
            <Skeleton width="100%" height="60vh" borderRadius="0.5rem" />
          </div>

          {/* Sidebar section */}
          <div className="lg:col-span-2 hidden lg:flex flex-col gap-3">
            <Skeleton width="100%" height="2rem" />
            <Skeleton width="100%" height="10rem" />
            <Skeleton width="100%" height="8rem" />
            <Skeleton width="100%" height="6rem" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default TemplateSkeleton;
