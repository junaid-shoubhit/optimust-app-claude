import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../../services/apiBinding";
import { Skeleton } from "primereact/skeleton";

const ProgressStatus = ({ payload }) => {
  const { entityId } = payload;
  const { data = [], isLoading } = useQuery({
    queryKey: ["tab-save-progress", entityId],
    enabled: !!payload?.entityId,
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: "/Utility/GetTabSaveProgress",
        method: "post",
        payload,
        signal,
      }),
    select: (res) => res?.data ?? [],
    staleTime: 30000,
  });

  // Detect which API response structure we received
  const isSaveProgress = useMemo(
    () => data.some((item) => "isSaved" in item),
    [data],
  );

  // Existing workflow progress logic
  const activeIndex = useMemo(
    () =>
      data.findIndex(
        (item) => item.isActive && item.status && item.status.trim() !== "",
      ),
    [data],
  );

  const steps = useMemo(() => {
    // --------------------------------
    // CASE 1: isSaved response
    // --------------------------------
    if (isSaveProgress) {
      return data.map((item) => ({
        ...item,
        state: item.isSaved ? "completed" : "pending",
        displayStatus: "",
      }));
    }

    // --------------------------------
    // CASE 2: status/isActive response
    // --------------------------------
    return data.map((item, index) => {
      let state = "pending";
      let displayStatus = "Pending";

      if (activeIndex !== -1) {
        if (index < activeIndex) {
          state = "completed";
          displayStatus = "Completed";
        } else if (index === activeIndex) {
          state = "active";
          displayStatus = "Current";
        }
      }

      return {
        ...item,
        state,
        displayStatus,
      };
    });
  }, [data, activeIndex, isSaveProgress]);

  if (!payload?.entityId) return null;

  if (isLoading) {
    return (
      <div className="w-full min-w-0 overflow-x-auto scrollbar-thin">
        <div className="flex min-w-max items-center">
          {Array.from({ length: 7 }).map((_, index) => (
            <div
              key={index}
              className={`
                relative flex h-8 min-w-[120px] items-center justify-between
                border border-gray-200 bg-gray-100
                pl-5 pr-3
                ${index !== 0 ? "-ml-2" : ""}
              `}
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%, 14px 50%)",
              }}
            >
              <Skeleton width="65%" height="0.7rem" borderRadius="8px" />

              {!isSaveProgress && (
                <Skeleton width="28%" height="1rem" borderRadius="999px" />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md p-2">
      <div className="flex min-w-max items-center">
        {steps.map((step, index) => {
          const completed = step.state === "completed";
          const active = step.state === "active";

          return (
            <div
              key={`${step.order ?? step.tabId}-${step.name}`}
              className={`
                group relative flex h-8 min-w-[100px] items-center
                ${isSaveProgress ? "justify-start" : "justify-between"}
                pl-5 pr-3 text-xs
                border transition-all duration-200 hover:shadow-md
                ${
                  completed
                    ? "bg-green-600 border-green-700 text-white"
                    : active
                      ? "bg-yellow-400 border-yellow-700 text-slate-700"
                      : "bg-[#ced9ef] border-[#c7cedb] text-slate-700"
                }
                ${index !== 0 ? "-ml-2" : ""}
              `}
              style={{
                clipPath:
                  "polygon(0 0, calc(100% - 18px) 0, 100% 50%, calc(100% - 18px) 100%, 0 100%, 14px 50%)",
              }}
            >
              <span className="font-extrabold truncate tracking-wide uppercase">
                {step.name}
              </span>

              {/* Only show status for the first API structure */}
              {!isSaveProgress && (
                <span
                  className={`
                    ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase
                    ${
                      completed
                        ? "bg-white/20 text-white"
                        : active
                          ? "bg-white/20 text-slate-700"
                          : "bg-slate-300 text-slate-700"
                    }
                  `}
                >
                  {step.status}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressStatus;
