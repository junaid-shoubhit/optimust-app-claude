import axios from "axios";
import axiosDMPrivate from "../utils/lib/axiosDMPrivate";
import axiosPrivate, { optimustURL } from "../utils/lib/axiosPrivate";

export const loginPostUser = async (payload, apiPath) => {
  try {
    const res = await optimustURL.post(apiPath, payload);
    return res?.data;
  } catch (error) {
    const errMsg =
      error?.response?.data?.errors || "An error occurred while logging in.";
    throw errMsg; // ❗️Now the caller's catch will handle it
  }
};

export const loginPatchUser = async (payload, apiPath) => {
  try {
    const res = await optimustURL.patch(apiPath, payload);
    return res?.data;
  } catch (error) {
    const errMsg =
      error?.response?.data?.errors || "An error occurred while logging in.";
    throw errMsg; // ❗️Now the caller's catch will handle it
  }
};

export const apiRequestOpen = async ({
  apiPath,
  payload = {},
  apiClient = "optimust",
  method = "get",
  config = {},
  signal, // 🔥 important
}) => {
  const client = apiClient === "dm" ? axiosDMPrivate : optimustURL;
  try {
    const lowerMethod = method.toLowerCase();

    const requestConfig = {
      ...config,
      signal, // 🔥 enable cancellation
    };

    let response;

    switch (lowerMethod) {
      case "get":
        response = await client.get(apiPath, {
          params: payload, // ✅ correct way
          ...requestConfig,
        });
        break;

      case "delete":
        response = await client.delete(apiPath, {
          data: payload,
          ...requestConfig,
        });
        break;

      case "post":
      case "put":
      case "patch":
        response = await client[lowerMethod](
          apiPath,
          payload,
          //  {
          //   page: 1,
          //   pageSize: 99999,
          //   ...payload,
          // },
          requestConfig,
        );
        break;

      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    return response.data;
  } catch (error) {
    // 🔥 Normalize error shape

    if (
      error?.name === "CanceledError" ||
      error?.code === "ERR_CANCELED" ||
      axios.isCancel(error)
    ) {
      return;
    }

    if (error?.isGlobalErrorHandled) {
      throw error;
    }

    // 🔥 Normalize error shape
    const message = error instanceof Error ? error.message : String(error);

    throw message;
  }
};

// Private API request function for OPTIMUST and Document Manager APIs
export const apiRequest = async ({
  apiPath,
  payload = {},
  apiClient = "optimust",
  method = "get",
  config = {},
  noErrorHandle = false,
  signal, // 🔥 important
}) => {
  const client = apiClient === "dm" ? axiosDMPrivate : axiosPrivate;

  try {
    const lowerMethod = method.toLowerCase();
    const isFormData = payload instanceof FormData;
    const requestConfig = {
      ...config,
      signal, // 🔥 enable cancellation
      headers: {
        ...(config.headers || {}),
        ...(isFormData ? { "Content-Type": "multipart/form-data" } : {}),
      },
    };

    let response;

    switch (lowerMethod) {
      case "get":
        response = await client.get(apiPath, {
          params: payload, // ✅ correct way
          ...requestConfig,
        });
        break;

      case "delete":
        response = await client.delete(apiPath, {
          data: payload,
          ...requestConfig,
        });
        break;

      case "post":
      case "put":
      case "patch":
        response = await client[lowerMethod](
          apiPath,
          payload,
          //  {
          //   page: 1,
          //   pageSize: 99999,
          //   ...payload,
          // },
          requestConfig,
        );
        break;

      default:
        throw new Error(`Unsupported method: ${method}`);
    }

    if (noErrorHandle) {
      return response.data;
    }
    if (response?.data?.statusCode === undefined) {
      // toast?.error("Error not handle in API");
      throw new Error(`Error not handle in API ${apiPath}`);
    } else if (
      (response?.data?.statusCode >= 200 && response?.data?.statusCode < 300) ||
      response?.data?.statusCode === 409
    ) {
      return response.data;
    } else {
      throw new Error(
        response.data?.message ||
          response.data?.error ||
          "Unexpected response from server",
      );
    }
    // return response.data;
  } catch (error) {
    console.log("error", error);
    if (
      error?.name === "CanceledError" ||
      error?.code === "ERR_CANCELED" ||
      axios.isCancel(error)
    ) {
      return;
    }

    if (error?.isGlobalErrorHandled) {
      throw error;
    }

    // 🔥 Normalize error shape
    const message = error instanceof Error ? error.message : String(error);

    // toast?.error(message);

    throw message;
  }
};

export const getOptions = async (payload, isAllOptions) => {
  try {
    const response = await axiosPrivate.post(
      `/utility/option${isAllOptions ? "All" : ""}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      },
    );

    return {
      options:
        response.data?.optionModelDT?.map((x) => ({
          label: x.label?.trim() || x.name,
          value: x.value || x.id || x.name,
        })) || [],
      page: response.data?.page || 1,
      pageSize: response.data?.pageSize || 0,
      dataSize: response.data?.dataSize || 0,
    };
  } catch (err) {
    console.error("Error fetching options:", err);
    return [];
  }
};

export const getCascadeOptions = async (payload, isAllOptions) => {
  try {
    const response = await axiosPrivate.post(
      `/utility/relation/option${isAllOptions ? "All" : ""}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      },
    );

    return {
      options:
        response.data?.optionModelDT?.map((x) => ({
          label: x.label?.trim() || x.name,
          value: x.value || x.id || x.name,
          ...x,
        })) || [],
      page: response.data?.page || 1,
      pageSize: response.data?.pageSize || 0,
      dataSize: response.data?.dataSize || 0,
    };
  } catch (err) {
    console.error("Error fetching options:", err);
    return [];
  }
};

export const getDynamicOptions = async (payload) => {
  try {
    const response = await axiosPrivate.post(
      `/utility/option/dynamic`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + localStorage.getItem("token"),
        },
      },
    );
    return {
      options:
        response.data?.dataResponse?.map((x) => ({
          label: x.label?.trim() || x.name,
          value: x.value || x.id || x.name,
          ...x,
        })) || [],
      page: response.data?.page || 1,
      pageSize: response.data?.pageSize || 0,
      dataSize: response.data?.dataSize || 0,
    };
  } catch (err) {
    console.error("Error fetching options:", err);
    return [];
  }
};
