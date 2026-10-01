const AdditionalClientSkeleton = () => {
  return (
    <div className="w-full h-full flex flex-col bg-white rounded-2xl animate-pulse">
      {/* Header */}
      <div className="shrink-0">
        <div className="flex px-3 items-center gap-2 pt-3">
          <div className="h-4 w-4 rounded bg-gray-200" />
          <div className="h-4 w-32 bg-gray-200 rounded" />
        </div>

        <div className="p-2 border-b-[0.5px] border-(--border-inverse)">
          <div className="h-10 w-full bg-gray-200 rounded-lg" />
        </div>
      </div>

      {/* Client List */}
      <div className="flex-1 overflow-y-auto px-2 py-5 space-y-3">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="p-3 rounded-xl border border-gray-200 bg-white"
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="h-10 w-10 rounded-full bg-gray-200" />

              {/* Content */}
              <div className="flex-1">
                <div className="h-4 w-40 bg-gray-200 rounded mb-2" />

                <div className="flex gap-3">
                  <div className="h-3 w-20 bg-gray-200 rounded" />
                  <div className="h-3 w-24 bg-gray-200 rounded" />
                </div>
              </div>
            </div>

            <div className="mt-3">
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdditionalClientSkeleton;
