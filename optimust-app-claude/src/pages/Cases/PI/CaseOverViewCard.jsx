import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../services/apiBinding";
// import { formatDate } from "../../../utils/constant";

const CaseOverviewSkeleton = () => {
  return (
    <div className="mx-3 relative mb-2 overflow-hidden rounded-3xl border border-[#4F5D95]/50 shadow-2xl">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[linear-gradient(90deg,#D4183D_0%,#FF6B6B_50%,#5B5FC7_100%)]" />

        <div
          className="h-full w-full rounded-3xl"
          style={{
            background:
              "linear-gradient(135deg,#1B2438 0%,#2D3654 60%,#3D4470 100%)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col gap-4 px-6 py-5">
        <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
          {/* Left */}
          <div className="flex-1">
            {/* Tag */}
            <div className="relative mb-3 h-6 w-24 overflow-hidden rounded-md bg-white/10">
              <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)]" />
            </div>

            {/* Title */}
            <div className="relative mb-3 h-7 w-56 overflow-hidden rounded-lg bg-white/10">
              <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)]" />
            </div>

            {/* Case Number */}
            <div className="relative mb-3 h-3 w-72 overflow-hidden rounded-lg bg-white/10">
              <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)]" />
            </div>

            {/* Description */}
            <div className="space-y-2">
              {[100, 95, 85, 70].map((width) => (
                <div
                  key={width}
                  className="relative h-2.5 overflow-hidden rounded-lg bg-white/10"
                  style={{ width: `${width}%` }}
                >
                  <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)]" />
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid min-w-[280px] grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
              >
                <div className="relative mx-auto mb-3 h-2 w-16 overflow-hidden rounded-lg bg-white/10">
                  <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)]" />
                </div>

                <div className="relative mx-auto h-6 w-20 overflow-hidden rounded-lg bg-white/10">
                  <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#5562A8]/30 pt-3">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index}>
                <div className="relative mb-2 h-2.5 w-24 overflow-hidden rounded-lg bg-white/10">
                  <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)]" />
                </div>

                <div className="relative h-3.5 w-16 overflow-hidden rounded-lg bg-white/10">
                  <div className="absolute inset-0 animate-[shimmer_2s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const formatCurrency = (amount) => {
  return `$${Number(amount || 0).toFixed(2)}`;
};

const CaseOverViewCard = ({ entityId }) => {
  const {
    data: overview,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["caseOverviewDetails", entityId],
    enabled: !!entityId,

    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: `Utility/CaseOverviewDetails/${entityId}`,
        method: "get",
        signal,
      }),

    select: (response) => {
      const data = response?.caseOverviewDetails || {};

      return {
        title: data.caseName || "—",
        tag: data.status || "—",
        statusAge: data.statusAge || "—",
        caseNumber: data.caseNumber || "—",
        matterType: data.matterType || "—",
        description: data.caseDescription || "—",
        statusModified: data.statusModified,
        statusModifiedBy: data.statusModifiedBy,
        lastCaseModified: data.lastCaseModified,
        lastCaseModifiedBy: data.lastCaseModifiedBy,
        // ADD THIS
        fieldsDetails: response?.fieldsDetails || [],
        stats: [
          {
            label: "PROJECTED SETTLEMENT",
            value: formatCurrency(data.projectedSettlement),
            color: "text-indigo-300",
          },
          {
            label: "SETTLED",
            value: formatCurrency(data.settled),
            color: "text-yellow-300",
          },

          {
            label: "COLLECTED",
            value: formatCurrency(data.collectedAmount),
            color: "text-green-400",
          },
          {
            label: "BALANCE",
            value: formatCurrency(data.balanceAmount),
            color: "text-rose-400",
          },
        ],

        footerItems: [
          {
            label: "PLAINTIFF NAME",
            value: data.plaintiffName || "—",
          },
          {
            label: "PLAINTIFF LANGUAGE",
            value: data.plaintiffLanguage || "—",
          },
          {
            label: "PRIMARY DEFENDANT",
            value: data.primaryDefendant || "—",
          },

          {
            label: "PRIMARY ATTORNEY",
            value: data.primaryAttorney || "—",
          },
          {
            label: "PRIMARY PARALEGAL",
            value: data.primaryParalegal || "—",
          },
        ],
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return <CaseOverviewSkeleton />;
  }

  // Error
  if (isError) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      "Unable to load case overview.";

    return (
      <div className="mx-3 relative mb-2 overflow-hidden rounded-3xl border border-red-500/30 shadow-2xl">
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            background:
              "linear-gradient(135deg,#281C2B 0%,#302438 60%,#3D2B46 100%)",
          }}
        />

        <div className="relative z-10 flex min-h-[180px] flex-col items-center justify-center px-6 py-8 text-center">
          {/* Icon */}
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-red-400/30 bg-red-500/10">
            <svg
              className="h-5 w-5 text-red-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v4m0 4h.01M10.29 3.86l-7.82 13a2 2 0 001.71 3h15.64a2 2 0 001.71-3l-7.82-13a2 2 0 00-3.42 0z"
              />
            </svg>
          </div>

          <h3 className="mb-1 text-sm font-semibold text-white">
            Unable to load case overview
          </h3>

          <p className="mb-4 max-w-md text-xs text-white/50">{errorMessage}</p>

          <button
            type="button"
            onClick={() => refetch()}
            className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/15"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // No data
  if (!overview) {
    return (
      <div className="mx-3 relative mb-2 overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
        <div
          className="absolute inset-0 rounded-3xl"
          style={{
            background:
              "linear-gradient(135deg,#1B2438 0%,#2D3654 60%,#3D4470 100%)",
          }}
        />

        <div className="relative z-10 flex min-h-[180px] items-center justify-center px-6 py-8">
          <p className="text-xs text-white/50">
            No case overview information available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-3 relative mb-2 overflow-hidden rounded-3xl border border-[#4F5D95]/50 shadow-2xl">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-[linear-gradient(90deg,#D4183D_0%,#FF6B6B_50%,#5B5FC7_100%)]" />

        <div
          className="h-full w-full rounded-3xl"
          style={{
            background:
              "linear-gradient(135deg,#1B2438 0%,#2D3654 60%,#3D4470 100%)",
          }}
        />
      </div>

      <div className="relative z-10 flex flex-col gap-4 px-6 py-5">
        <div className="flex flex-col gap-8 lg:flex-row lg:justify-between">
          {/* Left Section */}
          <div className="flex-1">
            <div className="flex gap-2">
              <div className="mb-1 flex flex-wrap gap-2">
                <span className="rounded-md border-[0.5px] border-[#D4183D66] bg-[#D4183D33] px-2 py-1 text-[10.5px] font-semibold text-[#FF6B6B]">
                  {overview.tag}
                </span>
              </div>

              <div className="mb-1 flex flex-wrap gap-2">
                <span className="rounded-md border-[0.5px] border-[#D4183D66] bg-[#D4183D33] px-2 py-1 text-[10.5px] font-semibold text-[#FF6B6B]">
                  STATUS AGE-{overview.statusAge}
                  <span className="rounded-md px-2 py-1 text-[10.5px] font-medium text-[#add1ff]">
                    {"-  "}
                    Modified by{" "}
                    <span className="text-[10.5px]">
                      {overview.statusModifiedBy || "—"}
                    </span>{" "}
                    on{" "}
                    <span className="text-[10.5px]">
                      {overview.statusModified
                        ? new Date(overview.statusModified).toLocaleDateString()
                        : "—"}
                    </span>
                  </span>
                </span>
              </div>
            </div>

            <h2 className="mb-2 text-[20px] font-bold text-white">
              {overview.title}
            </h2>

            <p className="mb-1 text-xs text-[#FFFFFF8C]">
              {overview.caseNumber} · {overview.matterType}
            </p>

            <p className="max-w-lg whitespace-pre-line text-[11px] text-[#FFFFFF8C]">
              {overview.description}
            </p>

            <p className="rounded-md py-1 text-[10.5px] font-medium text-[#add1ff]">
              Last case modified by{" "}
              <span className="text-[10.5px]">
                {overview.lastCaseModifiedBy || "—"}
              </span>{" "}
              on{" "}
              <span className="text-[10.5px]">
                {overview.lastCaseModified
                  ? new Date(overview.lastCaseModified).toLocaleDateString()
                  : "—"}
              </span>
            </p>
          </div>

          {/* Right Stats */}
          <div className="grid grid-cols-2 gap-3">
            {overview.stats?.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center justify-center rounded-2xl border border-[#5A6799]/60 bg-white/5 p-2 backdrop-blur-sm"
              >
                <div className="text-[9px] font-semibold tracking-[0.18em] text-slate-400">
                  {item.label}
                </div>

                <div className={`text-[18px] font-bold ${item.color}`}>
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[#5562A8]/30 pt-2">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
            {overview.footerItems?.map((item) => (
              <div key={item.label}>
                <div className="text-[9px] font-semibold uppercase text-[#FFFFFF8C]">
                  {item.label}
                </div>

                <div className="text-[11px] font-medium text-white">
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseOverViewCard;
