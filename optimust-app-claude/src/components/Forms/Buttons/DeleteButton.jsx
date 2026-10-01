import { confirmPopup } from "primereact/confirmpopup";
import { toast } from "react-toastify";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import CustomButton from "./CustomButton";
import { apiRequest } from "../../../services/apiBinding";

const DeleteButton = ({
  id,
  apiPath,
  apiClient = "optimust",
  message = "Are you sure?",
  invalidateKeys = [],
  apiCallNeeded,
  dataKey = "data",
  onDelete,
  className = "!text-[#A30D11] !p-0 !w-fit !rounded-none",
}) => {
  console.log("invalidateKeys", invalidateKeys);
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      // No API, just resolve successfully
      if (!apiPath) return { success: true };

      const finalApiPath = apiPath.replace(":id", id);

      return apiRequest({
        apiPath: finalApiPath,
        method: "delete",
        apiClient,
      });
    },

    onSuccess: (response) => {
      if (apiPath) {
        if (response?.success) {
          toast.success("Deleted");
        } else {
          toast.info(response?.message);
        }

        invalidateKeys.forEach((key) => {
          if (apiCallNeeded) {
            queryClient.invalidateQueries({ queryKey: key });
          } else {
            queryClient.setQueryData(key, (oldData) => {
              console.log("oldData", oldData);
              if (!oldData) return oldData;
              return {
                ...oldData,
                [dataKey]: oldData[dataKey]?.filter((item) => item.id !== id),
              };
            });
          }
          console.log("key", key);
        });
      }

      // Execute callback only if provided
    },

    onError: (error) => {
      console.error(error);
      toast.error("Error deleting record");
    },
  });

  const handleDelete = (e) => {
    confirmPopup({
      className: "deletePopup",
      target: e.currentTarget,
      message,
      defaultFocus: "accept",
      accept: () => {
        deleteMutation.mutate(undefined, {
          onSuccess: () => {
            onDelete?.(); // 🔥 run custom logic AFTER API success
          },
        });
      },
      // accept: () => deleteMutation.mutate(),
    });
  };

  return (
    <CustomButton
      onClick={handleDelete}
      text
      disabled={!apiPath && !onDelete}
      icon="text-xs! p-1 bg-[#FEE8EC] pi pi-trash"
      loading={deleteMutation.isPending}
      className={className}
      aria-label="Delete"
    />
  );
};

export default DeleteButton;
