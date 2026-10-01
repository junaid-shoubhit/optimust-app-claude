export const getOptionId = (option) => option?.value ?? null;

export const getOptionIds = (option) =>
  Array.isArray(option)
    ? option.map((item) => ({ id: item?.value }))
    : option?.value
      ? [{ id: option.value }]
      : [];

export const buildWorkflowTypeMappingPayload = (
  mappingValues = [],
  cascadeOptions = [],
) =>
  mappingValues.flatMap((field, index) =>
    (field.value || []).map((selected) => ({
      relationalFieldDefinitionId: cascadeOptions[index]?.value,
      id: selected.value,
    })),
  );

export const buildLookupPayload = (dataTable, dataField = "name") => ({
  dataTable,
  dataField,
  searchTerm: "",
});
