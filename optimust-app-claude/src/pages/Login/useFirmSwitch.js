import { useMutation } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { ENDPOINTS } from "../../utils/APIEndpoints";
import { optimustURL } from "../../utils/lib/axiosPrivate";

export const useFirmSwitch = ({
  tokenKey = "firm-token",
  showSuccessToast = true,
  showErrorToast = true,
  onSuccess,
  onError,
} = {}) => {
  return useMutation({
    mutationFn: async ({ firm, userName }) => {
      const token = localStorage.getItem(tokenKey);

      console.log("Firm switch token:", tokenKey, token);

      const { data: response } = await optimustURL.post(
        ENDPOINTS.FIRM_CHANGE,
        {
          firmId: firm.value,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      return {
        response,
        firm,
        userName,
      };
    },

    onSuccess: ({ response, firm, userName }) => {
      localStorage.setItem("token", response.token);
      localStorage.setItem("email", response.email);
      localStorage.setItem("userName", response?.userName || userName);
      localStorage.setItem("selected-firm", JSON.stringify(firm));

      if (showSuccessToast) {
        toast.success("Firm switched successfully");
      }

      onSuccess?.({
        response,
        firm,
      });
    },

    onError: (error) => {
      if (showErrorToast) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Firm selection failed.",
        );
      }

      onError?.(error);
    },
  });
};
