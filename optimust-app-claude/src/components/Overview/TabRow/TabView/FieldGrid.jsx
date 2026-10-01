import { Skeleton } from "primereact/skeleton";
import { memo, useMemo } from "react";
import { formatDateUI } from "../../../../utils/constant";
import { RAW_TEXT_DATE_DEFINITION_IDS } from "../../../NoTabsForm/noTabConstant";

import { formatFieldValue } from "../../../../utils/constant";

const renderValue = (field) => {
  const { name, type, value, dataType, definitionId, formatterId } = field;
  if (type === "bit" || dataType === "bit") {
    if (value === "1" || value === 1 || value === true) return "Yes";
    if (value === "0" || value === 0 || value === false) return "No";
    return "--";
  }

  if (
    RAW_TEXT_DATE_DEFINITION_IDS.includes(Number(definitionId)) ||
    Number(formatterId) === 6
  ) {
    if (!value) return "--";
    return formatDateUI(value, dataType, false);
  }

  if (
    ["date", "datetime"].includes(type?.toLowerCase()) ||
    ["date", "datetime"].includes(dataType?.toLowerCase())
  ) {
    if (!value) return "--";

    return type?.toLowerCase() === "date" || dataType?.toLowerCase() === "date"
      ? formatDateUI(value, "date")
      : formatDateUI(value, "datetime");
  }

  if (name === "Signature") {
    return value ? (
      <img src={value} alt="Signature" className="max-h-24 object-contain" />
    ) : (
      "--"
    );
  }

  // Apply formatter (Phone, Currency, SSN, etc.)
  if (formatterId) {
    console.log("formatterId field", field);
    return formatFieldValue(field);
  }
  return value ?? "--";
};

const SkeletonGrid = () => (
  <>
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="grid grid-cols-2 gap-2">
        <Skeleton height="16px" />
        <Skeleton height="16px" />
      </div>
    ))}
  </>
);

const FieldGrid = ({ fields = [], isLoading }) => {
  const content = useMemo(() => {
    if (isLoading) return <SkeletonGrid />;

    if (!fields.length) {
      return <p className="text-gray-400">No details found</p>;
    }
    return fields.map((field) => (
      <div
        key={field.definitionId ?? field.name}
        className="grid grid-cols-2 px-3 py-2 border-b-[0.5px] border-(--border-inverse) last:border-b-0"
      >
        <p className="text-xs text-[#6B7280]">{field.name}</p>
        <p className="text-right text-xs">{renderValue(field)}</p>
      </div>
    ));
  }, [fields, isLoading]);

  return <div className=" rounded-lg">{content}</div>;
};

export default memo(FieldGrid);
