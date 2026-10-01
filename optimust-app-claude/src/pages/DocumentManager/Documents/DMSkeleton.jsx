import { Skeleton } from "primereact/skeleton";

const DMLoadingSkeleton = ({ type = "list", count = 15 }) => {
  // --------------------------------------------------
  // SIDEBAR
  // --------------------------------------------------
  if (type === "sidebar") {
    return (
      <div className="p-3 space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <Skeleton shape="circle" width="2rem" height="2rem" />

            <Skeleton width={`${65 + ((i * 13) % 25)}%`} height="1rem" />
          </div>
        ))}
      </div>
    );
  }

  // --------------------------------------------------
  // GRID VIEW - MATCHES DMGridView
  // --------------------------------------------------
  if (type === "grid") {
    return (
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-6
          gap-3
          mb-4
          p-3
        "
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="
              border
              border-gray-200
              rounded-lg
              overflow-hidden
              bg-white
            "
          >
            {/* File Header / Icon Area */}
            <div
              className="
                relative
                flex
                items-center
                justify-center
                h-20
                w-full
                rounded-t-lg
                bg-(--background-heading-active)
              "
            >
              {/* File Icon */}
              <Skeleton shape="circle" width="2.8rem" height="2.8rem" />

              {/* Actions */}
              <div
                className="
                  absolute
                  top-2
                  right-2
                  p-1
                  rounded-lg
                  bg-(--foreground)
                "
              >
                <Skeleton width="1.5rem" height="1.5rem" />
              </div>
            </div>

            {/* File Information */}
            <div className="px-3 py-3 space-y-2">
              {/* File Name */}
              <Skeleton width={`${70 + ((i * 11) % 25)}%`} height="0.9rem" />

              {/* File Name second line */}
              {i % 3 === 0 && <Skeleton width="45%" height="0.85rem" />}

              {/* File Type */}
              <Skeleton width="45%" height="0.75rem" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  // --------------------------------------------------
  // TABLE VIEW - MATCHES DMTableView
  // --------------------------------------------------
  if (type === "table") {
    return (
      <div className="w-full overflow-x-auto">
        <table className="text-xs w-full border-collapse bg-white rounded-lg shadow-sm">
          {/* Header */}
          <thead
            className="
              border-b-[0.5px]
              border-(--border-inverse)
              bg-(--background-table)
            "
          >
            <tr>
              <th className="p-2 text-left">
                <Skeleton width="5rem" height="0.8rem" />
              </th>

              <th className="p-2 text-left">
                <Skeleton width="6rem" height="0.8rem" />
              </th>

              <th className="p-2 text-left hidden sm:table-cell">
                <Skeleton width="3rem" height="0.8rem" />
              </th>

              <th className="p-2 text-left hidden md:table-cell">
                <Skeleton width="4rem" height="0.8rem" />
              </th>

              <th className="p-2 text-left hidden lg:table-cell">
                <Skeleton width="6rem" height="0.8rem" />
              </th>

              <th className="p-2 text-left hidden lg:table-cell">
                <Skeleton width="5rem" height="0.8rem" />
              </th>

              <th className="p-2 text-left hidden lg:table-cell">
                <Skeleton width="5rem" height="0.8rem" />
              </th>

              <th className="p-2 text-left hidden xl:table-cell">
                <Skeleton width="5rem" height="0.8rem" />
              </th>

              <th className="p-2 text-left hidden xl:table-cell">
                <Skeleton width="5rem" height="0.8rem" />
              </th>

              <th className="p-2">
                <Skeleton width="1.5rem" height="0.8rem" />
              </th>
            </tr>
          </thead>

          {/* Rows */}
          <tbody>
            {Array.from({ length: count }).map((_, i) => (
              <tr
                key={i}
                className="
                  border-b-[0.5px]
                  border-(--border-inverse)
                  transition-all
                  duration-200
                  ease-in-out
                  odd:bg-white
                  even:bg-(--background-heading)
                "
              >
                {/* Name */}
                <td className="w-48 p-2">
                  <div className="flex items-start gap-2">
                    <Skeleton shape="circle" width="1.4rem" height="1.4rem" />

                    <div className="flex-1 space-y-1.5 pt-0.5">
                      <Skeleton
                        width={`${65 + ((i * 17) % 30)}%`}
                        height="0.8rem"
                      />

                      {i % 3 === 0 && <Skeleton width="45%" height="0.7rem" />}
                    </div>
                  </div>
                </td>

                {/* Description */}
                <td className="p-2 hidden sm:table-cell">
                  <Skeleton
                    width={`${60 + ((i * 7) % 30)}%`}
                    height="0.75rem"
                  />
                </td>

                {/* Type */}
                <td className="p-2 hidden sm:table-cell">
                  <Skeleton width="3rem" height="0.75rem" />
                </td>

                {/* Folder */}
                <td className="p-2 hidden md:table-cell">
                  <Skeleton
                    width={`${55 + ((i * 9) % 35)}%`}
                    height="0.75rem"
                  />
                </td>

                {/* Uploaded From */}
                <td className="p-2 hidden lg:table-cell">
                  <Skeleton
                    width={`${60 + ((i * 5) % 30)}%`}
                    height="0.75rem"
                  />
                </td>

                {/* Created Date */}
                <td className="p-2 hidden lg:table-cell">
                  <Skeleton width="5rem" height="0.75rem" />
                </td>

                {/* Created By */}
                <td className="p-2 hidden lg:table-cell">
                  <Skeleton
                    width={`${55 + ((i * 13) % 30)}%`}
                    height="0.75rem"
                  />
                </td>

                {/* Modified Date */}
                <td className="p-2 hidden xl:table-cell">
                  <Skeleton width="5rem" height="0.75rem" />
                </td>

                {/* Modified By */}
                <td className="p-2 hidden xl:table-cell">
                  <Skeleton
                    width={`${55 + ((i * 11) % 30)}%`}
                    height="0.75rem"
                  />
                </td>

                {/* Actions */}
                <td className="p-2 text-right">
                  <div className="flex justify-end">
                    <Skeleton width="1.5rem" height="1.5rem" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // --------------------------------------------------
  // DEFAULT LIST
  // --------------------------------------------------
  return (
    <div className="p-3 space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="
            flex
            gap-3
            items-center
            p-2
            border
            border-gray-200
            rounded
            bg-white
          "
        >
          <Skeleton shape="circle" width="2rem" height="2rem" />

          <Skeleton width={`${70 + ((i * 9) % 25)}%`} height="1rem" />
        </div>
      ))}
    </div>
  );
};

export default DMLoadingSkeleton;
