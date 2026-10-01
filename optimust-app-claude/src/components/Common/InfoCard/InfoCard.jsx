import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../services/apiBinding";

const InfoCard = ({
  children,
  payload,
  header, // ✅ new prop
  position = "top",
}) => {
  const [hovered, setHovered] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["infoCard", payload],
    queryFn: () =>
      apiRequest({
        apiPath: "/utility/infoCard",
        method: "post",
        payload,
      }),
    enabled: hovered && !!payload,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });

  const info = data?.infoData?.[0] || {};

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}

      {hovered && (
        <div className="absolute z-50 min-w-[260px] max-w-[360px] bg-white border border-gray-200 shadow-xl rounded-xl text-sm overflow-hidden">
          
          {/* 🔹 Header */}
          {header && (
            <div className="px-4 py-2 border-b border-gray-200 bg-gray-50 font-semibold text-gray-900">
              {header}
            </div>
          )}

          {/* 🔹 Body */}
          <div className="p-4 space-y-3">
            {isLoading ? (
              <div>Loading...</div>
            ) : Object.keys(info).length === 0 ? (
              <div>No data</div>
            ) : (
              Object.entries(info).map(([key, value], index, arr) => {
                if (!value) return null;

                return (
                  <div key={key}>
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-black">
                        {key}
                      </span>
                      <span className="text-black break-words">
                        {value}
                      </span>
                    </div>

                    {/* 🔹 Dotted Divider */}
                    {index !== arr.length - 1 && (
                      <div className="border-t border-dotted border-gray-300 mt-3"></div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InfoCard;