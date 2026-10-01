import { useMemo } from "react";

import KeyValueList from "./KeyValueList";

import {
  FIELD_CONFIGS,
  getDisplayValue,
  mapSelectedFields,
} from "../../../utils/constants/fieldConfigs";
import { useFieldVisibility } from "./useFieldVisibility";
import { formatFieldValue } from "../../../utils/constant";

const EntityList = ({
  fieldData,
  dynamicValues,
  isLoading,
  isError,
  errorMessage,
  limit,
  isExpanded = false,
  columns,
  variant,
  configKey,
  mapper,
  mode = "all",
}) => {
  const validation = fieldData?.validationData || [];
  /* =========================================================
     DEFAULT DYNAMIC MAPPER
  ========================================================= */

  const mappedData = useMemo(() => {
    /* ---------------------------------------------------------
       1. Custom mapper has highest priority
    --------------------------------------------------------- */

    if (typeof mapper === "function") {
      return mapper(fieldData, dynamicValues) || [];
    }

    /* ---------------------------------------------------------
       2. Static config mapping
    --------------------------------------------------------- */

    if (configKey && FIELD_CONFIGS[configKey]) {
      const config = FIELD_CONFIGS[configKey];

      const transformedData = config?.transformData
        ? config.transformData(fieldData)
        : fieldData;

      const fields =
        typeof config.fields === "function"
          ? config.fields(transformedData)
          : config.fields;

      return mapSelectedFields(transformedData, fields);
    }

    /* ---------------------------------------------------------
       3. Dynamic fields mapping
    --------------------------------------------------------- */
    const definitions = fieldData?.fieldDefinitions || [];

    const singleFields = dynamicValues?.singleFields || {};

    const values = dynamicValues?.data || [];

    /**
     * Create metadata lookup once.
     *
     * definitionId -> metadata
     *
     * O(n)
     */
    const metaMap = new Map();

    for (const item of values) {
      metaMap.set(Number(item.definitionId), {
        isImportant: item.isImportant,
        type: item.type,
        order: item.orderByExpression,
      });
    }

    const importantFields = [];
    const normalFields = [];

    /**
     * Map fields once and directly push
     * into the correct collection.
     *
     * Avoids:
     *
     * mapped.filter(...)
     * mapped.filter(...)
     */
    for (const field of definitions) {
      const fieldId = Number(field.id ?? field.definitionId);

      const key = field.name?.replace(/\s+/g, "_");

      const storedValue = singleFields[key];

      const meta = metaMap.get(fieldId) || {};

      const fieldType = (
        meta.type ||
        field.type ||
        field.datatype ||
        ""
      ).toLowerCase();

      const mappedField = {
        id: fieldId,

        label: field.name,

        value: getDisplayValue(storedValue, fieldType),

        isImportant: meta.isImportant ?? field.isImportant ?? false,

        order: Number(field.orderByExpression ?? meta.order ?? 9999),

        type: fieldType,

        formatterId: field?.formatterId,

        formatterName: field?.formatterName,
      };

      if (mappedField.isImportant) {
        importantFields.push(mappedField);
      } else {
        normalFields.push(mappedField);
      }
    }

    /* ---------------------------------------------------------
       Sort fields
    --------------------------------------------------------- */

    importantFields.sort((a, b) => a.order - b.order);

    normalFields.sort((a, b) => a.order - b.order);

    return [...importantFields, ...normalFields];
  }, [fieldData, dynamicValues, mapper, configKey]);

  /* =========================================================
     APPLY SHOW VISIBILITY RULES

     Fields without SHOW rules:
       -> Always visible

     Fields controlled by SHOW:
       -> Hidden by default
       -> Visible only when condition matches
  ========================================================= */

  const visibleMappedData = useFieldVisibility({
    fields: mappedData,
    fieldDefinitions: fieldData?.fieldDefinitions || [],
    validations: validation || [],
    dynamicValues,
    mode,
    disabled: !!configKey,
  });

  /* =========================================================
     APPLY LIMIT

     Important:
     Visibility filtering happens BEFORE limit.

     Example:

     mappedData = 10 fields
     hidden = 3 fields
     limit = 6

     Result:
     First 6 VISIBLE fields
  ========================================================= */

  const visibleFields = useMemo(() => {
    if (isExpanded || limit == null) {
      return visibleMappedData;
    }

    return visibleMappedData.slice(0, limit);
  }, [visibleMappedData, isExpanded, limit]);

  /* =========================================================
     FORMAT DATA FOR KeyValueList

     {
       "Party Type": "Attorney",
       "First Name": "John"
     }
  ========================================================= */

  const formattedData = useMemo(() => {
    const result = {};

    for (const field of visibleFields) {
      result[field.label] = formatFieldValue(field);
    }

    return result;
  }, [visibleFields]);

  /* =========================================================
     BUILD FIELD CONFIG

     [
       {
         label: "Party Type",
         key: "Party Type",
         type: "select"
       }
     ]
  ========================================================= */

  const fieldsConfig = useMemo(() => {
    return visibleFields.map((field) => ({
      label: field.label,
      key: field.label,
      type: field.type,
      formatterId: field?.formatterId,
      formatterName: field?.formatterName,
    }));
  }, [visibleFields]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <KeyValueList
      data={formattedData}
      fields={fieldsConfig}
      isLoading={isLoading}
      isError={isError}
      errorMessage={errorMessage}
      columns={columns}
      variant={variant}
    />
  );
};

export default EntityList;
