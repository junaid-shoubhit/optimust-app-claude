import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "primereact/skeleton";
import classNames from "classnames";
import { FiClock, FiPlus, FiEdit2, FiTrash2 } from "react-icons/fi";

import { apiRequest } from "../../../../services/apiBinding";
import SelectField from "../../../../components/Forms/Select/Select";
import { formatDateUI } from "../../../../utils/constant";

// ---------------------------------------------
// Helpers
// ---------------------------------------------
const getInitials = (name = "") =>
  name
    .replace(/\(.*?\)/g, "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

// const formatDate = (date) => {
//   if (!date) return "-";

//   return new Date(date).toLocaleString("en-IN", {
//     day: "2-digit",
//     month: "short",
//     hour: "numeric",
//     minute: "2-digit",
//   });
// };

const getActionIcon = (type) => {
  switch (type?.toUpperCase()) {
    case "INSERT":
      return <FiPlus size={11} />;

    case "UPDATE":
      return <FiEdit2 size={11} />;

    case "DELETE":
      return <FiTrash2 size={11} />;

    default:
      return <FiClock size={11} />;
  }
};

const getActionStyles = (type) => {
  switch (type?.toUpperCase()) {
    case "INSERT":
      return {
        badge: "bg-green-50 text-green-700 border border-green-200",
        line: "bg-green-400",
      };

    case "UPDATE":
      return {
        badge: "bg-blue-50 text-blue-700 border border-blue-200",
        line: "bg-blue-400",
      };

    case "DELETE":
      return {
        badge: "bg-red-50 text-red-700 border border-red-200",
        line: "bg-red-400",
      };

    default:
      return {
        badge: "bg-gray-50 text-gray-700 border border-gray-200",
        line: "bg-gray-300",
      };
  }
};

// ---------------------------------------------
// Skeleton Loader
// ---------------------------------------------
const HistorySkeleton = () => {
  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-xl p-3"
        >
          <div className="flex gap-2">
            <Skeleton shape="circle" size="2rem" />

            <div className="flex-1 flex flex-col gap-2">
              <Skeleton width="180px" height="12px" />
              <Skeleton width="100%" height="28px" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------
// Main Component
// ---------------------------------------------
const CaseHistoryLogs = ({ caseId }) => {
  // ---------------------------------------------
  // Filters
  // ---------------------------------------------
  const [selectedUser, setSelectedUser] = useState(null);

  const [selectedActionType, setSelectedActionType] = useState(null);

  const [selectedField, setSelectedField] = useState(null);

  // ---------------------------------------------
  // API
  // ---------------------------------------------
  const { data, isLoading } = useQuery({
    queryKey: ["case-history", caseId],
    enabled: !!caseId,

    queryFn: async ({ signal }) => {
      return await apiRequest({
        apiPath: "/Case/history",
        method: "post",
        payload: {
          caseId,
          page: 1,
          pageSize: 50,
        },
        signal,
      });
    },
  });

  // ---------------------------------------------
  // History
  // ---------------------------------------------
  const history = useMemo(() => {
    return data?.history || [];
  }, [data]);

  // ---------------------------------------------
  // User Options
  // ---------------------------------------------
  const userOptions = useMemo(() => {
    const uniqueUsers = [
      ...new Set(history?.map((item) => item?.user)?.filter(Boolean)),
    ];

    return uniqueUsers.map((user) => ({
      label: user,
      value: user,
    }));
  }, [history]);

  // ---------------------------------------------
  // Action Type Options
  // ---------------------------------------------
  const actionTypeOptions = useMemo(() => {
    const uniqueActionTypes = [
      ...new Set(history?.map((item) => item?.actionType)?.filter(Boolean)),
    ];

    return uniqueActionTypes.map((type) => ({
      label: type,
      value: type,
    }));
  }, [history]);

  // ---------------------------------------------
  // Field Options
  // ---------------------------------------------
  const fieldOptions = useMemo(() => {
    const uniqueFields = [
      ...new Set(
        history
          ?.map((item) => item?.action?.split(":")?.[0]?.trim())
          ?.filter(Boolean),
      ),
    ];

    return uniqueFields.map((field) => ({
      label: field,
      value: field,
    }));
  }, [history]);

  // ---------------------------------------------
  // Filtered History
  // ---------------------------------------------
  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const fieldName = item?.action?.split(":")?.[0]?.trim();

      const matchesUser = selectedUser?.value
        ? item?.user === selectedUser.value
        : true;

      const matchesActionType = selectedActionType?.value
        ? item?.actionType === selectedActionType.value
        : true;

      const matchesField = selectedField?.value
        ? fieldName === selectedField.value
        : true;

      return matchesUser && matchesActionType && matchesField;
    });
  }, [history, selectedUser, selectedActionType, selectedField]);

  // ---------------------------------------------
  // Loading
  // ---------------------------------------------
  if (isLoading) {
    return <HistorySkeleton />;
  }

  // ---------------------------------------------
  // Empty State
  // ---------------------------------------------
  if (!history.length) {
    return (
      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 text-center">
        <p className="text-sm text-gray-500">No history logs found</p>
      </div>
    );
  }

  // ---------------------------------------------
  // UI
  // ---------------------------------------------
  return (
    <div className="flex flex-col gap-3 px-3">
      {/* Filters */}
      <div className="flex flex-wrap justify-end gap-2">
        {/* User */}
        <div className="w-[220px]">
          <SelectField
            value={selectedUser}
            onChange={(selected) => setSelectedUser(selected)}
            defaultOptions={userOptions}
            placeholder="Filter By User"
            isClearable
            noErrorMessage
          />
        </div>

        {/* Action Type */}
        <div className="w-[220px]">
          <SelectField
            value={selectedActionType}
            onChange={(selected) => setSelectedActionType(selected)}
            defaultOptions={actionTypeOptions}
            placeholder="Filter By Action Type"
            isClearable
            noErrorMessage
          />
        </div>

        {/* Field */}
        <div className="w-[220px]">
          <SelectField
            value={selectedField}
            onChange={(selected) => setSelectedField(selected)}
            defaultOptions={fieldOptions}
            placeholder="Filter By Field"
            isClearable
            noErrorMessage
          />
        </div>
      </div>

      {/* History List */}
      <div className="relative flex flex-col gap-2">
        {filteredHistory.map((item, index) => {
          const styles = getActionStyles(item?.actionType);

          return (
            <div
              key={`${item?.logDate}-${index}`}
              className="relative bg-white border border-gray-200 rounded-xl px-4 py-3 hover:border-gray-300 transition-all"
            >
              {/* Timeline Line */}
              {index !== filteredHistory.length - 1 && (
                <div
                  className={classNames(
                    "absolute left-[25px] top-[42px] w-[1.5px] h-[calc(100%-18px)]",
                    styles.line,
                  )}
                />
              )}

              <div className="flex gap-3 items-start">
                {/* Avatar */}
                <div
                  className={classNames(
                    "relative z-10 min-w-[36px] h-[36px] rounded-full flex items-center justify-center text-sm font-semibold",
                    styles.badge,
                  )}
                >
                  {getInitials(item?.user)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                  {/* User */}
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-semibold text-(--color-fontFour) truncate">
                      {item?.user}
                    </span>

                    <span className="text-gray-400">•</span>

                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatDateUI(item?.logDate)}
                    </span>
                  </div>

                  {/* Action Type */}
                  <div
                    className={classNames(
                      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
                      styles.badge,
                    )}
                  >
                    {getActionIcon(item?.actionType)}

                    {item?.actionType}
                  </div>

                  {/* Field */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-gray-500 whitespace-nowrap font-medium">
                      Field:
                    </span>

                    <span className="font-medium text-(--color-fontFour)">
                      {item?.action || "-"}
                    </span>
                  </div>

                  {/* Old Value */}
                  {!!item?.oldValue && (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-red-500 whitespace-nowrap font-medium">
                        Old Value:
                      </span>

                      <span className="text-red-600">{item?.oldValue}</span>
                    </div>
                  )}

                  {/* New Value */}
                  {!!item?.newValue && (
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-green-600 whitespace-nowrap font-medium">
                        New Value:
                      </span>

                      <span className="font-semibold text-green-700">
                        {item?.newValue}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* No Matching Data */}
        {!filteredHistory.length && (
          <div className="bg-white border border-dashed border-gray-300 rounded-xl p-6 text-center">
            <p className="text-sm text-gray-500">No matching history found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CaseHistoryLogs;
