// src/components/PermissionsTable.jsx

import React from "react";
import { Checkbox } from "primereact/checkbox";

const PermissionsTable = ({
  data = [],
  permissions = {},
  setPermissions,
  tableConfig = [],
}) => {
  const handleChange = (id, key, value) => {
    setPermissions((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [key]: value,
      },
    }));
  };

  return (
    <div className="w-full border border-gray-400 rounded-xl overflow-hidden">
      {/* Rows */}
      {data.map((item) => {
        const perms = permissions[item.id] || {};

        return (
  <div
  key={item.id}
  className="grid grid-cols-[3fr_7fr] px-6 py-4 border-t border-gray-400 items-center"
>
  {/* Name */}
  <div className="font-medium text-gray-800">
    {item.name}
  </div>

  {/* Checkboxes */}
  <div className="flex justify-start gap-10 flex-wrap">
    {tableConfig.map((col) => (
      <div
        key={col.key}
        className="flex items-center gap-3 min-w-[90px]"
      >
        <Checkbox
          inputId={`${col.key}-${item.id}`}
          checked={!!perms[col.key]}
          onChange={(e) =>
            handleChange(item.id, col.key, e.checked)
          }
        />
        <label
          htmlFor={`${col.key}-${item.id}`}
          className="text-xs uppercase text-gray-600"
        >
          {col.header}
        </label>
      </div>
    ))}
  </div>
</div>
        );
      })}
    </div>
  );
};

export default PermissionsTable;