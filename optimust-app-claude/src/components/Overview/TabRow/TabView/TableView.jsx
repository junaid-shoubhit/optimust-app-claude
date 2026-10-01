import { useMemo, memo } from "react";
import { Link } from "react-router-dom";
import { Tooltip } from "primereact/tooltip";
import { Skeleton } from "primereact/skeleton";
import TruncatedText from "../../../Common/KeyValueList/TruncatedText";
import { RAW_TEXT_DATE_DEFINITION_IDS } from "../../../NoTabsForm/noTabConstant";
import { formatDateUI, formatFieldValue } from "../../../../utils/constant";
import BasicDetailsHover from "../../../Common/InfoCard/BasicDetailsHover";

const normalizeKey = (val) => String(val ?? "").trim();

const SkeletonRow = ({ columnsLength }) => (
  <tr>
    {Array.from({ length: columnsLength }).map((_, i) => (
      <td key={i} className="px-3 py-2">
        <Skeleton height="16px" />
      </td>
    ))}
  </tr>
);

const buildTableData = (fields = []) => {
  if (!Array.isArray(fields) || !fields.length) return [];

  const rowsMap = new Map();

  for (const field of fields) {
    if (!field?.name) continue;

    // Ignore fields that don't belong to an actual table row
    if (field.rowIndex === null || field.rowIndex === undefined) {
      continue;
    }

    // Keep the original rowIndex
    const rowIndex = field.rowIndex;

    if (!rowsMap.has(rowIndex)) {
      rowsMap.set(rowIndex, Object.create(null));
    }

    let value = field.value ?? "--";

    if (field.dataType === "bit" || field.type === "bit") {
      if (value === "1" || value === 1 || value === true) {
        value = "Yes";
      } else if (value === "0" || value === 0 || value === false) {
        value = "No";
      } else {
        value = "--";
      }
    }

    if (
      RAW_TEXT_DATE_DEFINITION_IDS.includes(field?.definitionId) ||
      Number(field?.formatterId) === 6
    ) {
      value = formatDateUI(value, field?.dataType?.toLowerCase(), false);
    }

    if (
      ["date", "datetime"].includes(field?.type?.toLowerCase()) ||
      ["date", "datetime"].includes(field?.dataType?.toLowerCase())
    ) {
      value = value
        ? field?.type?.toLowerCase() === "date" ||
          field?.dataType?.toLowerCase() === "date"
          ? formatDateUI(value, "date")
          : formatDateUI(value, "datetime")
        : "--";
    }

    // Apply formatter (Phone, Currency, SSN)
    if (
      value !== "--" &&
      field.formatterId &&
      !["bit", "date", "datetime"].includes(field?.dataType?.toLowerCase()) &&
      !["bit", "date", "datetime"].includes(field?.type?.toLowerCase())
    ) {
      value = formatFieldValue({
        ...field,
        value,
      });
    }

    rowsMap.get(rowIndex)[normalizeKey(field.name)] = {
      value,
      redirectPath: field?.redirectPath,
      entityId: field?.entityId,
      entityCodeId: field?.redirectEntityCodeId,
    };
  }

  return [...rowsMap.entries()]
    .sort(([rowA], [rowB]) => Number(rowA) - Number(rowB))
    .map(([rowIndex, values]) => ({
      rowIndex,
      values,
    }));
};

const TableView = ({ columns = [], fields = [], loading = false }) => {
  const rows = useMemo(() => buildTableData(fields), [fields]);

  if (!Array.isArray(columns) || !columns.length) return null;

  const getRedirectUrl = (redirectPath, entityId) => {
    if (!redirectPath || entityId === null || entityId === undefined) {
      return null;
    }

    return `${redirectPath}/overview?id=${entityId}`;
  };

  return (
    // overflow-x-auto here — table scrolls inside the card, card stays its grid width
    <div className="w-full overflow-x-auto min-w-0">
      <Tooltip target=".tv-tooltip" />

      <table className="min-w-max w-full text-sm">
        <thead className="bg-(--background-heading-active)">
          <tr>
            {columns.map((col, idx) => {
              const name = normalizeKey(col?.name) || col - `${idx}`;
              return (
                <th
                  key={name}
                  className="text-[#6B7280] px-3 py-2 text-left whitespace-nowrap"
                >
                  {/* <div className="text-xs tv-tooltip" data-pr-tooltip={name}>
                    {name}
                  </div> */}
                  <TruncatedText className="text-xs" value={name} />
                </th>
              );
            })}
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 && loading && (
            <>
              <SkeletonRow columnsLength={columns.length} />
              <SkeletonRow columnsLength={columns.length} />
            </>
          )}

          {rows.length === 0 && !loading && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-3 py-4 text-center text-gray-400"
              >
                No records found
              </td>
            </tr>
          )}

          {rows.map((row) => (
            <tr
              key={`row-${row.rowIndex}`}
              className="border-t-[0.1px] border-(--border-inverse)"
            >
              {columns.map((col, cIdx) => {
                const colName = normalizeKey(col?.name) || col - `${cIdx}`;
                const cell = row.values[colName];

                const value =
                  typeof cell === "object"
                    ? (cell?.value ?? "--")
                    : (cell ?? "--");

                const redirectPath =
                  typeof cell === "object" ? cell?.redirectPath : null;

                const entityId =
                  typeof cell === "object" ? cell?.entityId : null;

                const entityCodeId =
                  typeof cell === "object" ? cell?.entityCodeId : null;

                const redirectUrl = getRedirectUrl(redirectPath, entityId);

                const isRedirectable =
                  redirectUrl && entityCodeId && value !== "--";

                const cellContent = (
                  <TruncatedText className="text-xs" value={value} />
                );

                return (
                  <td key={`${row.rowIndex}-${colName}`} className="px-3 py-2">
                    {isRedirectable ? (
                      <BasicDetailsHover
                        entityId={entityId}
                        entityCodeId={entityCodeId}
                      >
                        <Link
                          to={redirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline cursor-pointer"
                        >
                          {cellContent}
                        </Link>
                      </BasicDetailsHover>
                    ) : (
                      cellContent
                    )}
                  </td>
                );
              })}
            </tr>
          ))}

          {rows.length > 0 && loading && (
            <SkeletonRow columnsLength={columns.length} />
          )}
        </tbody>
      </table>
    </div>
  );
};

export default memo(TableView);
