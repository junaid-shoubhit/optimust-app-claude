import CustomButton from "../../components/Forms/Buttons/CustomButton";
import { useMutation } from "@tanstack/react-query";
import { apiRequestOpen } from "../../services/apiBinding";
import { toast } from "react-toastify";

const MicrosoftLogin = () => {
  const microsoftLoginMutation = useMutation({
    mutationFn: async () => {
      return apiRequestOpen({
        apiPath: "User/microsoft-login",
        method: "get",
      });
    },

    onSuccess: (response) => {
      const loginUrl = response;

      if (!loginUrl) {
        toast.error("Microsoft login URL not received.");
        return;
      }

      window.location.href = loginUrl;
    },

    onError: (error) => {
      toast.error(error || "Unable to start Microsoft login.");
    },
  });

  return (
    <CustomButton
      type="button"
      icon="pi pi-microsoft"
      iconPos="left"
      label="Login with Microsoft"
      loading={microsoftLoginMutation.isPending}
      onClick={() => microsoftLoginMutation.mutate()}
      className="bg-white! text-gray-400! border-gray-400! uppercase"
    />
  );
};

export default MicrosoftLogin;
