import React, { memo, useEffect, useRef, useState } from "react";
import { OverlayPanel } from "primereact/overlaypanel";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

import { apiRequest } from "../../../../../../services/apiBinding";
import CustomButton from "../../../../../../components/Forms/Buttons/CustomButton";
import SelectField from "../../../../../../components/Forms/Select/Select";

const ConvertToCase = ({
  label = "Convert To Case",
  icon,
  entityId: intakeId,
  isConverted: initialConverted = false,
  isLoading,
}) => {
  const queryClient = useQueryClient();
  const overlayRef = useRef(null);
  const [isConverted, setIsConverted] = useState(initialConverted);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      caseStatusId: "",
    },
  });
  const { mutate, isPending } = useMutation({
    mutationFn: async (payload) => {
      return apiRequest({
        apiPath: "/Intakes/ConvertToCase",
        method: "post",
        payload,
      });
    },
    onSuccess: async (response) => {
      toast.success(
        response?.message || "Intake successfully converted to case",
      );

      queryClient.setQueryData(
        ["tabs-nested-dynamic-id", intakeId],
        (oldData) => ({
          ...oldData,
          convertCaseFlag: true,
        }),
      );
      await queryClient.refetchQueries({
        queryKey: ["intake-entity"],
        type: "active",
      });
      overlayRef.current?.hide();
      reset();
    },
    onError: (error) => {
      toast.error(error || "Failed to convert intake to case");
    },
  });

  const onSubmit = (data) => {
    mutate({
      intakeId,
      caseStatusId: data.caseStatusId?.id,
    });
  };

  useEffect(() => {
    setIsConverted(initialConverted);
  }, [initialConverted]);

  return (
    <>
      <CustomButton
        label={isLoading ? "Loading..." : isConverted ? "Converted" : label}
        icon={isConverted ? "pi pi-check-circle" : icon}
        className={`primary ${isConverted ? "bg-[#6dedb1]! text-black!" : ""}`}
        disabled={isLoading || isConverted}
        loading={isLoading}
        onClick={(e) => {
          if (!isLoading && !isConverted) {
            overlayRef.current?.toggle(e);
          }
        }}
      />

      <OverlayPanel
        ref={overlayRef}
        dismissable
        showCloseIcon
        onHide={() => reset()}
        className="shadow-4 p-4"
        style={{
          marginTop: "4px",
          width: "350px",
          borderRadius: "12px",
        }}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col">
            <div className="flex flex-col gap-4">
              <Controller
                name="caseStatusId"
                control={control}
                rules={{
                  required: "Case Status is required",
                }}
                render={({ field }) => (
                  <div className="flex flex-col gap-2">
                    {/* <label className="font-medium">
                      Case Status <span className="text-red-500">*</span>
                    </label> */}

                    <SelectField
                      {...field}
                      label="Case Status"
                      payload={{
                        dataTable: "ctCaseStatuses_SAGViewIntake",
                        dataField: "name",
                      }}
                      isRequired={true}
                      placeholder="Select Case Status"
                      invalid={errors?.caseStatusId}
                      //   noErrorMessage={true}
                    />
                  </div>
                )}
              />
            </div>

            <div className="mt-4 pt-3 border-top-1 surface-border">
              <CustomButton
                type="submit"
                label={isPending ? "Converting..." : "Convert To Case"}
                icon="pi pi-check"
                className="primary w-full"
                loading={isPending}
                disabled={isPending}
              />
            </div>
          </div>
        </form>
      </OverlayPanel>
    </>
  );
};

export default memo(ConvertToCase);
