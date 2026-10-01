import axios from "axios";
import { toast } from "react-toastify";

import { API } from "../APIEndpoints";

import { queryClient } from "./queryClient";

import {
  getSessionSignal,
  expireSession,
  isSessionExpired,
} from "./sessionController";

export const optimustURL = axios.create({
  baseURL: import.meta.env.API || API,
  headers: {
    "Content-Type": "application/json",
  },
});

const axiosPrivate = axios.create({
  baseURL: import.meta.env.API || API,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Prevent multiple network/server error toasts
 */
let networkErrorToastShown = false;
let networkErrorToastTimer = null;

const showNetworkErrorToast = (message) => {
  if (networkErrorToastShown) {
    return;
  }

  networkErrorToastShown = true;

  toast.error(message, {
    toastId: "global-network-error",
  });

  clearTimeout(networkErrorToastTimer);

  networkErrorToastTimer = setTimeout(() => {
    networkErrorToastShown = false;
    networkErrorToastTimer = null;
  }, 5000);
};

/**
 * Mark an error when the Axios interceptor has already
 * handled/displayed the error to the user.
 *
 * This prevents apiRequest -> React Query -> onError
 * from displaying another toast.
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
axiosPrivate.interceptors.request.use(
  (config) => {
    /**
     * Block new requests after logout/session expiration
     */
    if (isSessionExpired()) {
      return Promise.reject(new axios.CanceledError("Session expired"));
    }

    /**
     * Attach token
     */
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    /**
     * Every request shares the same session signal.
     *
     * This allows session expiration to cancel
     * all active requests.
     */
    config.signal = getSessionSignal();

    return config;
  },

  (error) => {
    return Promise.reject(error);
  },
);

/**
 * RESPONSE INTERCEPTOR
 */
axiosPrivate.interceptors.response.use(
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
     * Do not show any toast for canceled requests.
     */
    if (
      error?.code === "ERR_CANCELED" ||
      axios.isCancel(error) ||
      error?.name === "CanceledError"
    ) {
      return Promise.reject(error);
    }

    /**
     * ---------------------------------------------------------
     * 401 - SESSION EXPIRED
     * ---------------------------------------------------------
     */
    if (error?.response?.status === 401) {
      /**
       * Only the FIRST 401 handles logout.
       */
      if (expireSession()) {
        /**
         * Cancel all React Query requests.
         */
        await queryClient.cancelQueries();

        /**
         * Clear React Query cache.
         */
        queryClient.clear();

        /**
         * Clear authentication data.
         */
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("SSID");

        /**
         * Show only one session-expired toast.
         */
        toast.error("Session expired. Please login again.", {
          toastId: "session-expired",
        });

        /**
         * Redirect to login.
         */
        setTimeout(() => {
          window.location.replace("/app/login");
        }, 500);
      }

      /**
       * Keep the original Axios error.
       */
      return Promise.reject(error);
    }

    const status = error?.response?.status;

    /**
     * ---------------------------------------------------------
     * NETWORK ERROR
     * ---------------------------------------------------------
     *
     * No response means the browser could not get
     * a response from the API server.
     *
     * Examples:
     * - API completely down
     * - internet disconnected
     * - ERR_NETWORK
     * - CORS/network failure
     */
    if (!error?.response) {
      showNetworkErrorToast(
        "Unable to connect to the server. Please check your connection and try again.",
      );

      /**
       * IMPORTANT:
       *
       * Tell apiRequest / React Query that the toast
       * has already been displayed.
       */
      return Promise.reject(markGlobalErrorHandled(error));
    }

    /**
     * ---------------------------------------------------------
     * SERVER UNAVAILABLE
     * ---------------------------------------------------------
     *
     * Useful during:
     * - deployment
     * - API restart
     * - gateway failure
     * - reverse proxy failure
     */
    if ([502, 503, 504].includes(status)) {
      showNetworkErrorToast(
        "The server is temporarily unavailable. Please try again shortly.",
      );

      /**
       * Prevent another toast in onError.
       */
      return Promise.reject(markGlobalErrorHandled(error));
    }

    /**
     * ---------------------------------------------------------
     * OTHER HTTP ERRORS
     * ---------------------------------------------------------
     *
     * These are intentionally NOT handled globally.
     *
     * The individual API/mutation can decide what
     * message should be shown.
     */
    switch (status) {
      case 400:
        break;

      case 403:
        break;

      case 404:
        break;

      default:
        break;
    }

    /**
     * Always preserve original Axios error.
     */
    return Promise.reject(error);
  },
);

export default axiosPrivate;
