import { apiRequest } from "../../services/apiBinding";

export const fetchFieldDefinition = async (id) => {
  return apiRequest({
    apiPath: `/FieldDefinition/${id}`,
    method: "get",
  });
};
