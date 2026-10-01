import React from "react";
import { useEffect, useRef } from "react";
import Select from "../Forms/Select/Select";
import { getDynamicOptions } from "../../services/apiBinding";
import { useQuery } from "@tanstack/react-query";

const DropdownFilter = ({ filters, setFilters, handleFilterValuesRef }) => {
  const masterEntityParameterName = "4985";

  const selectedMasterEntityFilter = filters?.filters?.find(
    (filter) => filter?.parameterName === masterEntityParameterName,
  );

  const createPayload = (dataTable, dataField = "name") => ({
    dataTable,
    dataField,
    searchTerm: "",
    page: 1,
    pageSize: 500,
  });

  const masterEntityOptionsQuery = useQuery({
    queryKey: ["masterEntityOptions"],
    queryFn: async () => {
      const response = await getDynamicOptions(
        createPayload("mstEntityDetailsWF"),
      );

      return response?.options || [];
    },
  });

  const masterEntityOptions = masterEntityOptionsQuery.data || [];

  useEffect(() => {
    if (masterEntityOptions.length > 0 && !selectedMasterEntityFilter) {
      const defaultOption = masterEntityOptions[0];

      setFilters((prev = {}) => ({
        ...prev,
        page: 1,
        pageSize: prev?.pageSize || 50,
        filters: [
          ...(prev?.filters || []).filter(
            (filter) => filter?.parameterName !== masterEntityParameterName,
          ),
          {
            parameterName: masterEntityParameterName,
            value: defaultOption.value,
            value2: null,
            label: defaultOption.label,
          },
        ],
        tableName: defaultOption.label,
      }));
    }
  }, [masterEntityOptions, selectedMasterEntityFilter, setFilters]);

  return (
    <div>
      <Select
        name="Master Entity"
        placeholder="Select Master Entity"
        value={selectedMasterEntityFilter || masterEntityOptions?.[0] || null}
        defaultOptions={masterEntityOptions}
        onChange={(e) => {
          handleFilterValuesRef();
          setFilters((prev = {}) => {
            const existingFilters = prev?.filters || [];
            const remainingFilters = existingFilters.filter(
              (filter) => filter?.parameterName !== masterEntityParameterName,
            );

            const nextFilters = {
              ...prev,
              page: 1,
              pageSize: prev?.pageSize || 50,
              filters: remainingFilters,
              tableName: e?.label,
            };

            if (e?.value != null) {
              nextFilters.filters = [
                // ...remainingFilters,
                {
                  parameterName: masterEntityParameterName,
                  value: e?.value || null,
                  value2: null,
                  label: e?.label || "",
                },
              ];
            }

            return nextFilters;
          });
        }}
        selectWidth="220px"
        selecthHeight="25px"
        isViewAllEnabled={false}
        maxHeight="55px"
        isClearable={false}
      />
    </div>
  );
};

export default DropdownFilter;
