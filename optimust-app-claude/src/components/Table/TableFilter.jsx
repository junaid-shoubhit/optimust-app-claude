import React, { memo } from "react";
import Input from "../Forms/Input/Input";
import Select from "../Forms/Select/Select";
import classNames from "classnames";

const TableFilter = ({
  filterConfig,
  field,
  columns,
  searchFilters,
  filters,
  setFilters,
  width,
}) => {
  const handleChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      page: 1,
      [name]: value,
    }));
  };
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      searchFilters(filters); // 👈 call API only when Enter is pressed
    }
  };
  switch (filterConfig.type) {
    case "yesNo":
      return (
        <Select
          defaultOptions={[
            { label: "Yes", value: 1 },
            { label: "No", value: 0 },
          ]}
          name={field}
          placeholder={columns?.header}
          isViewAllEnabled={false}
          payload={filterConfig.payload}
          value={filters?.[field] || ""}
          onChange={(e) => handleChange(field, e || "")}
          onKeyDown={handleKeyDown}
          selectWidth={width ? width : "120px"}
          maxHeight="55px"
          // isMulti={true}
          // className="!text-[12px] !w-30"
        />
      );
    case "select":
      return (
        <Select
          name={field}
          placeholder={columns?.header}
          payload={filterConfig.payload}
          value={filters?.[field] || ""}
          onChange={(e) => handleChange(field, e || "")}
          onKeyDown={handleKeyDown}
          selectWidth={width ? width : "120px"}
          selecthHeight="25px"
          isViewAllEnabled={filterConfig?.isViewAllEnabled !== false}
          isMulti={filterConfig?.isMulti || false}
          maxHeight="55px"
          // className="!text-[12px] !w-30"
        />
      );
    default:
      return (
        <Input
          type="text"
          name={field}
          className={classNames(
            `!h-[25px] !text-[12px] ${width ? width : "!w-30"}`,
          )}
          placeholder={columns?.header}
          value={filters?.[field] || ""}
          onChange={(e) => handleChange(field, e.target.value)}
          onKeyDown={handleKeyDown}
        />
      );
  }
};

export default memo(TableFilter);
