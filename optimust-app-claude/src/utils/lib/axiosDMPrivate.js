import { toast } from "react-toastify";
import axios from "axios";
import { PATH } from "../pagePath";
import { DM_API } from "../APIEndpoints";

const optimustDMURL = axios.create({
  baseURL: import.meta.env.VITE_API_OPTIMUST_DM_API_URL || DM_API,
  headers: {
    "Content-Type": "application/json",
  },
});

const axiosDMPrivate = optimustDMURL;

/**
 * Prevent duplicate global network/server error toasts
 */
let networkErrorToastShown = false;
let networkErrorToastTimer = null;

const showNetworkErrorToast = (message) => {
  if (networkErrorToastShown) {
    return;
  }

  networkErrorToastShown = true;

  toast.error(message, {
    toastId: "global-dm-network-error",
  });

  clearTimeout(networkErrorToastTimer);

  networkErrorToastTimer = setTimeout(() => {
    networkErrorToastShown = false;
    networkErrorToastTimer = null;
  }, 5000);
};

/**
 * Mark error as already handled globally.
 *
 * apiRequest checks this flag and will not
 * try to handle the error again.
 */
const markGlobalErrorHandled = (error) => {
  if (error) {
    error.isGlobalErrorHandled = true;
  }

  return error;
};

/**
 * REQUEST INTERCEPTOR
 */
axiosDMPrivate.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem("token");

    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * RESPONSE INTERCEPTOR
 */
axiosDMPrivate.interceptors.response.use(
  /**
   * SUCCESS
   */
  (response) => {
    return response;
  },

  /**
   * ERROR
   */
  async (error) => {
    /**
     * ---------------------------------------------------------
     * CANCELED REQUEST
     * ---------------------------------------------------------
     *
     * Do not show toast for canceled requests.
     */
    if (
      error?.code === "ERR_CANCELED" ||
      axios.isCancel(error) ||
      error?.name === "CanceledError"
    ) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;

    /**
     * ---------------------------------------------------------
     * 401 - SESSION EXPIRED
     * ---------------------------------------------------------
     */
    if (status === 401) {
      toast.error("Session expired. Please login again.", {
        toastId: "dm-session-expired",
      });

      localStorage.removeItem("token");

      setTimeout(() => {
        window.location.href = PATH.LOGIN;
      }, 500);

      return Promise.reject(markGlobalErrorHandled(error));
    }

    /**
     * ---------------------------------------------------------
     * NETWORK ERROR
     * ---------------------------------------------------------
     *
     * No response means the request could not reach
     * the server.
     */
    if (!error?.response) {
      showNetworkErrorToast(
        "Unable to connect to the server. Please check your connection and try again.",
      );

      return Promise.reject(markGlobalErrorHandled(error));
    }

    /**
     * ---------------------------------------------------------
     * SERVER UNAVAILABLE
     * ---------------------------------------------------------
     *
     * 502 / 503 / 504
     */
    if ([502, 503, 504].includes(status)) {
      showNetworkErrorToast(
        "The server is temporarily unavailable. Please try again shortly.",
      );

      return Promise.reject(markGlobalErrorHandled(error));
    }

    /**
     * ---------------------------------------------------------
     * OTHER HTTP ERRORS
     * ---------------------------------------------------------
     *
     * 400 / 403 / 404 / 500 etc.
     *
     * Do NOT show a global toast here.
     *
     * Let apiRequest / the calling component handle it.
     */
    return Promise.reject(error);
  },
);

export default axiosDMPrivate;
