import { useMemo } from "react";
import ActionsColumn from "../../Table/ActionsColumn";
import { UserIcon, UsersIcon } from "lucide-react";
import { formatDateUI } from "../../../utils/constant";

const statusStyles = {
  WIP: {
    topBar: "bg-[linear-gradient(90deg,#0EA5E9_0%,rgba(14,165,233,0.5)_100%)]",
    badge: "bg-sky-100 text-sky-700",
    border: "border-sky-200",
  },

  Assigned: {
    topBar: "bg-[linear-gradient(90deg,#5B5FC7_0%,rgba(91,95,199,0.5)_100%)]",
    badge: "bg-indigo-100 text-indigo-700",
    border: "border-indigo-200",
  },

  Pending: {
    topBar: "bg-[linear-gradient(90deg,#F59E0B_0%,rgba(245,158,11,0.5)_100%)]",
    badge: "bg-amber-100 text-amber-700",
    border: "border-amber-200",
  },

  Completed: {
    topBar: "bg-[linear-gradient(90deg,#16A34A_0%,rgba(22,163,74,0.5)_100%)]",
    badge: "bg-green-100 text-green-700",
    border: "border-green-200",
  },

  Canceled: {
    topBar: "bg-[linear-gradient(90deg,#DC2626_0%,rgba(220,38,38,0.5)_100%)]",
    badge: "bg-red-100 text-red-700",
    border: "border-red-200",
  },

  "Not Assigned": {
    topBar: "bg-[linear-gradient(90deg,#6B7280_0%,rgba(107,114,128,0.5)_100%)]",
    badge: "bg-gray-100 text-gray-700",
    border: "border-gray-200",
  },
};

/* Match a field by its columnName instead of its position in the array */
const findFieldByName = (fields, name) =>
  fields.find(
    (f) => f?.columnName?.trim().toLowerCase() === name.toLowerCase(),
  );

const clean = (value) => (typeof value === "string" ? value.trim() : value);

const TaskCard = ({ row, fieldsConfig = [], actions, setSelectedRows }) => {
  /* ================= SORT ================= */
  const sortedFields = useMemo(() => {
    return [...fieldsConfig].sort(
      (a, b) => a.orderByExpression - b.orderByExpression,
    );
  }, [fieldsConfig]);

  /* ================= FIELD PICKS ================= */
  const caseField = findFieldByName(sortedFields, "Case");

  const titleField =
    findFieldByName(sortedFields, "Task Type") || sortedFields[0];

  const subTitleField =
    findFieldByName(sortedFields, "Task Subtype") || sortedFields[1];

  const dueDateField =
    findFieldByName(sortedFields, "Task Due") ||
    sortedFields.find((f) => f.type === "date");

  const statusField =
    findFieldByName(sortedFields, "Task Status") ||
    sortedFields.find(
      (f) => f.type === "select" && /status/i.test(f.columnName),
    );

  const usersField = findFieldByName(sortedFields, "Users");

  const userGroupsField = findFieldByName(sortedFields, "User Groups");

  const commentField =
    findFieldByName(sortedFields, "Comments") ||
    sortedFields.find((f) => f.type === "text");

  /* ================= VALUE GETTER ================= */
  const getValue = (f) => clean(row?.[f?.parameterName]);

  const caseValue = getValue(caseField);
  const title = getValue(titleField);
  const subTitle = getValue(subTitleField);
  const dueDate = getValue(dueDateField);
  const status = getValue(statusField);
  const users = getValue(usersField);
  const userGroups = getValue(userGroupsField);
  const comments = getValue(commentField);

  const currentStatusStyle = statusStyles[status] || {
    topBar: "bg-gray-100",
    badge: "bg-gray-100 text-gray-600",
    border: "border-gray-200",
  };

  /* ================= Event / Task  ================= */
  const categoryField = findFieldByName(sortedFields, "Category");

  const category = getValue(categoryField);

  const isEvent = category === "Event";
  const isTask = category === "Task";

  /* =================Fields  ================= */
  const fromDateField = findFieldByName(sortedFields, "Date and Time (From)");

  const toDateField = findFieldByName(sortedFields, "Date and Time (To)");

  const fromDate = getValue(fromDateField);
  const toDate = getValue(toDateField);

  /* ================= Card Theme  ================= */

  const cardTheme = isEvent
    ? {
        container: "text-emerald-700 from-emerald-50/40 to-white",
        badge: "bg-violet-100 text-violet-700",
      }
    : {
        container: " from-sky-50/40 to-white",
        badge: "bg-sky-100 text-sky-700",
      };

  // const cardTheme = isEvent
  //   ? {
  //       container:
  //         "border-l-4 border-emerald-200 bg-emerald-50 text-emerald-700 from-emerald-50/40 to-white",
  //       badge: "bg-violet-100 text-violet-700",
  //     }
  //   : {
  //       container:
  //         "border-l-4 border-sky-200 bg-sky-50 from-sky-50/40 to-white",
  //       badge: "bg-sky-100 text-sky-700",
  //     };

  /* ================= EXCLUDE ================= */
  const excluded = [
    caseField?.parameterName,
    titleField?.parameterName,
    subTitleField?.parameterName,
    dueDateField?.parameterName,
    statusField?.parameterName,
    usersField?.parameterName,
    userGroupsField?.parameterName,
    commentField?.parameterName,

    categoryField?.parameterName,
    fromDateField?.parameterName,
    toDateField?.parameterName,
  ];

  const extraFields = sortedFields.filter(
    (f) => !excluded.includes(f.parameterName),
  );

  // const formatDate = (date) =>
  //   date ? moment.utc(date).format("MMM DD, YYYY") : "-";

  const isOverdue =
    Boolean(dueDate) &&
    new Date(dueDate) < new Date() &&
    status !== "Completed";
  return (
    <div
      className={`group relative rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col ${cardTheme.container}`}
    >
      {/* ================= TOP ACCENT BAR ================= */}
      <div
        className={`h-[4px] w-full ${
          isOverdue
            ? "bg-gradient-to-r from-rose-500 via-pink-400 to-rose-300"
            : currentStatusStyle.topBar
        }`}
      />

      <div className="flex flex-col gap-3">
        <div className="py-2 px-4 flex flex-col gap-2">
          {/* ================= HEADER ================= */}
          <div className="flex items-center justify-between gap-2">
            {isOverdue ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-200 whitespace-nowrap">
                Overdue
              </span>
            ) : status ? (
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap `}
              >
                {status}
              </span>
            ) : (
              <span />
            )}

            <div className="text-right">
              {isEvent ? (
                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-semibold whitespace-nowrap text-gray-500">
                    From: {formatDateUI(fromDate, "datetime")}
                  </span>

                  <span className="text-[11px] font-semibold whitespace-nowrap text-gray-500">
                    To: {formatDateUI(toDate, "datetime")}
                  </span>
                </div>
              ) : (
                dueDate && (
                  <span
                    className={`text-[11px] font-semibold whitespace-nowrap ${
                      isOverdue ? "text-rose-500" : "text-gray-500"
                    }`}
                  >
                    Due: {formatDateUI(dueDate, "date")}
                  </span>
                )
              )}
            </div>
          </div>

          {/* ================= CASE ================= */}
          {caseField && (
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                {caseField.columnName}
              </p>
              <p className="text-[11px] font-bold text-(--text-secondary) truncate">
                {caseValue || "—"}
              </p>
            </div>
          )}

          {/* ================= TASK TYPE / SUBTYPE ================= */}
          <div className={`grid gap-4  grid-cols-2`}>
            {titleField && (
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  {titleField.columnName}
                </p>
                <p className="text-[11px] text-[#1A1F36] break-words">
                  {title || "-"}
                </p>
              </div>
            )}

            {subTitleField && (
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                  {subTitleField.columnName}
                </p>
                <p className="text-[11px] text-[#1A1F36] break-words">
                  {subTitle || "-"} {isEvent}
                </p>
              </div>
            )}
          </div>

          {/* ================= USERS / USER GROUPS ================= */}
          {(usersField || userGroupsField) && (
            <div className="grid grid-cols-2 gap-2">
              {usersField && (
                <div
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 min-w-0 bg-(--background-heading) border-[0.5px] border-[#00000014]`}
                >
                  <UserIcon size={14} className="text-(--text-secondary)" />
                  <span className="text-xs font-medium text-[#1A1F36] truncate">
                    {users || "-"}
                  </span>
                </div>
              )}

              {userGroupsField && (
                <div
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 min-w-0 bg-(--background-heading) border-[0.5px] border-[#00000014]`}
                >
                  <UsersIcon size={12} className="text-gray-400" />
                  <span className="text-xs font-medium text-gray-700 truncate">
                    {userGroups || "-"}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ================= EXTRA FIELDS ================= */}
          {!isEvent ? (
            extraFields.length > 0 && (
              <div className="grid grid-cols-1 gap-2">
                {extraFields.map((field) => {
                  const value = getValue(field);

                  return (
                    <div
                      key={field.parameterName}
                      className={`rounded-lg px-3 py-2 bg-(--background-heading) border-[0.5px] border-[#00000014]`}
                    >
                      <p className="text-xs break-words">
                        <span className="text-gray-400">
                          {field.columnName}:
                        </span>{" "}
                        <span className="font-medium text-gray-800">
                          {value || "-"}
                        </span>
                      </p>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="h-[25px]" />
          )}

          <div className="grid grid-cols-[1fr_auto] items-end">
            {/* ================= COMMENTS ================= */}
            {comments && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
                  {commentField?.columnName}
                </p>

                <div
                  className={`rounded-lg px-3 py-2 bg-(--background-heading) border-[0.5px] border-[#00000014]`}
                >
                  <p
                    className="text-xs text-gray-700 overflow-hidden"
                    style={{
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      minHeight: "2rem",
                    }}
                  >
                    {comments}
                  </p>
                </div>
              </div>
            )}

            {/* ================= ACTIONS ================= */}
            <div className="px-3 py-2 flex">
              <ActionsColumn
                rowData={row}
                actions={actions}
                setSelectedRows={setSelectedRows}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
