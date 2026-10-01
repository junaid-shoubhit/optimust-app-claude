export const createPayload = (dataTable, dataField = "name") => ({
  dataTable,
  dataField,
  searchTerm: "",
});



export const getId = (option) => option?.value || null;

export const mapMultiValues = (values, key) =>
  values?.map((v) => ({ [key]: v.value })) || [];