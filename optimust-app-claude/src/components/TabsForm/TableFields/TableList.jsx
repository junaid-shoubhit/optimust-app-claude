import { memo, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import CustomButton from "../../../components/Forms/Buttons/CustomButton";
import { getFieldKey } from "../tabConstant";
import { formatFieldValue } from "../../../utils/constant";
import BasicDetailsHover from "../../Common/InfoCard/BasicDetailsHover";

const TableList = ({
  rows,
  fields,
  handleAdd,
  handleEdit,
  handleDelete,
  handleUndoDelete,
}) => {
  console.log("fields", fields);

  const getRedirectUrl = useCallback((redirectPath, entityId) => {
    if (
      !redirectPath ||
      entityId === null ||
      entityId === undefined
    ) {
      return null;
    }

    return `${redirectPath}/overview?id=${entityId}`;
  }, []);

  const renderCell = useCallback(
    (rowData, fieldMeta) => {
      const value =
        rowData?.[getFieldKey(fieldMeta.name)];

      console.log("value", value);

      if (value == null || value === "") return "";

      const type = fieldMeta?.type?.toLowerCase();
      const datatype =
        fieldMeta?.datatype?.toLowerCase();

      const getDisplayValue = (currentValue) => {
        if (
          typeof currentValue === "object" &&
          !Array.isArray(currentValue)
        ) {
          return (
            currentValue?.label ??
            currentValue?.name ??
            ""
          );
        }

        return currentValue;
      };

      if (fieldMeta?.formatterId) {
        return formatFieldValue({
          value,
          formatterId: fieldMeta.formatterId,
        });
      }

      switch (type) {
        case "select": {
          return getDisplayValue(value);
        }

        case "multiselect":
        case "multi-select": {
          if (Array.isArray(value)) {
            return value
              .map((item) => {
                if (typeof item === "object") {
                  return (
                    item?.label ??
                    item?.name ??
                    ""
                  );
                }

                return item;
              })
              .filter(Boolean)
              .join(", ");
          }

          return getDisplayValue(value);
        }

        case "checkbox": {
          if (typeof value === "boolean") {
            return value ? "Yes" : "No";
          }

          if (Array.isArray(value)) {
            return value
              .map((item) => {
                if (typeof item === "object") {
                  return (
                    item?.label ??
                    item?.name ??
                    ""
                  );
                }

                return item;
              })
              .filter(Boolean)
              .join(", ");
          }

          if (typeof value === "string") {
            const normalizedValue =
              value.toLowerCase().trim();

            if (
              normalizedValue === "true" ||
              normalizedValue === "yes" ||
              normalizedValue === "1"
            ) {
              return "Yes";
            }

            if (
              normalizedValue === "false" ||
              normalizedValue === "no" ||
              normalizedValue === "0"
            ) {
              return "No";
            }
          }

          if (typeof value === "number") {
            return value === 1 ? "Yes" : "No";
          }

          return value;
        }

        case "date":
        case "datetime":
        case "date-time": {
          const date =
            value instanceof Date
              ? value
              : new Date(value);

          return isNaN(date.getTime())
            ? ""
            : date.toLocaleDateString();
        }

        case "number":
        case "numeric":
        case "int":
        case "integer":
        case "decimal":
        case "float": {
          return getDisplayValue(value);
        }

        case "text":
        case "textarea":
        case "input":
        case "string": {
          return getDisplayValue(value);
        }

        default: {
          if (datatype?.includes("date")) {
            const date =
              value instanceof Date
                ? value
                : new Date(value);

            return isNaN(date.getTime())
              ? ""
              : date.toLocaleDateString();
          }

          if (Array.isArray(value)) {
            return value
              .map((item) => {
                if (typeof item === "object") {
                  return (
                    item?.label ??
                    item?.name ??
                    ""
                  );
                }

                return item;
              })
              .filter(Boolean)
              .join(", ");
          }

          if (typeof value === "object") {
            return (
              value?.label ??
              value?.name ??
              ""
            );
          }

          return value;
        }
      }
    },
    [],
  );

  const getColumnBody = useCallback(
    (fieldMeta) => (rowData) => {
      const rawValue =
        rowData?.[getFieldKey(fieldMeta.name)];

      const cell = renderCell(
        rowData,
        fieldMeta,
      );

      const entityId =
        typeof rawValue === "object" &&
        !Array.isArray(rawValue)
          ? rawValue?.value
          : rawValue;

      const redirectUrl = getRedirectUrl(
        fieldMeta?.redirectPath,
        entityId,
      );

      if (redirectUrl && cell !== "") {
        return (
          <BasicDetailsHover
            entityId={entityId}
            entityCodeId={
              fieldMeta?.redirectEntityCodeId
            }
          >
            <div
              className="truncate-3-lines"
              title={cell}
            >
              <Link
                to={redirectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline cursor-pointer"
              >
                {cell}
              </Link>
            </div>
          </BasicDetailsHover>
        );
      }

      return (
        <div
          className="truncate-3-lines"
          title={cell}
        >
          {cell}
        </div>
      );
    },
    [
      renderCell,
      getRedirectUrl,
    ],
  );

  const tableColumns = useMemo(
    () =>
      fields.map((f) => (
        <Column
          key={f.id}
          style={{
            maxWidth: "180px",
            minWidth: "140px",
          }}
          header={
            <div className="truncate-2-lines">
              {f.name}
            </div>
          }
          body={getColumnBody(f)}
        />
      )),
    [fields, getColumnBody],
  );

  const rowClassName = useCallback(
    (rowData) => {
      if (rowData.__isDeleted)
        return "deleted-row-highlight";

      if (rowData.__isNew)
        return "new-row-highlight";

      if (rowData.__isEdit)
        return "edit-row-highlight";

      return "";
    },
    [],
  );

  return (
    <DataTable
      showGridlines
      value={rows}
      className="tab-table"
      scrollable
      responsiveLayout="scroll"
      rowClassName={rowClassName}
    >
      {tableColumns}

      <Column
        header={() => (
          <CustomButton
            type="button"
            icon="pi pi-plus"
            text
            className="p-0! w-fit! rounded-none! text-(--color-primary)!"
            aria-label="Add"
            onClick={handleAdd}
          />
        )}
        body={(rowData, options) => {
          const isDeleted =
            rowData.__isDeleted;

          return !isDeleted ? (
            <div className="flex gap-3 justify-center">
              <CustomButton
                type="button"
                onClick={() =>
                  handleEdit(
                    rowData,
                    options.rowIndex,
                  )
                }
                text
                icon="pi pi-pencil"
                className="text-(--color-fontFive)! p-0! w-fit! rounded-none!"
                aria-label="Edit"
              />

              <CustomButton
                type="button"
                onClick={() =>
                  handleDelete(
                    options.rowIndex,
                  )
                }
                text
                icon="pi pi-trash"
                className="text-[#A30D11]! p-0! !w-fit! rounded-none!"
                aria-label="Delete"
              />
            </div>
          ) : (
            <CustomButton
              type="button"
              onClick={() =>
                handleUndoDelete(
                  options.rowIndex,
                )
              }
              text
              icon="pi pi-undo"
              className="text-[#2e7d32]! p-0! w-fit! rounded-none!"
              aria-label="Undo Delete"
            />
          );
        }}
        frozen
        alignFrozen="right"
        style={{
          width: "60px",
          textAlign: "center",
        }}
      />
    </DataTable>
  );
};

export default memo(TableList);
