import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCascadeOptions } from "../../../services/apiBinding";
import SelectField from "../Select/Select";

const SelectOpField = ({ payload = {}, effects, fieldMeta, ...props }) => {
  const shouldFetch = !effects?.disabled;

  const { data, isLoading } = useQuery({
    queryKey: ["cascadeOptions", payload],
    enabled: shouldFetch,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    queryFn: () =>
      getCascadeOptions({
        page: 1,
        pageSize: 10,
        ...payload,
      }),
  });

  const options = useMemo(() => data?.options ?? [], [data?.options]);
  console.log("fieldMeta options", options);
  useEffect(() => {
    if (!options.length) return;

    const currentValue = fieldMeta?.value;
    console.log("fieldMeta currentValue", currentValue);
    // const currentValueValue =
    //   currentValue && typeof currentValue === "object"
    //     ? currentValue.value
    //     : currentValue;

    // Existing value found.
    // This is important for edit mode.
    // if (
    //   currentValueValue !== undefined &&
    //   currentValueValue !== null &&
    //   currentValueValue !== ""
    // ) {
    //   return;
    // }

    // No existing value -> select first option.
    fieldMeta?.onChange?.(options[0]);
  }, [options, fieldMeta?.value, fieldMeta?.onChange, fieldMeta]);
  console.log("fieldMeta", fieldMeta?.name, fieldMeta?.value);
  return (
    <SelectField
      {...props}
      {...fieldMeta}
      value={fieldMeta?.value}
      disabled
      defaultOptions={options}
      isCustomLoading={isLoading}
    />
  );
};

export default SelectOpField;
