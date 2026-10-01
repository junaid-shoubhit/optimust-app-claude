import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import SelectField from "../../../../../../../components/Forms/Select/Select";
import CustomButton from "../../../../../../../components/Forms/Buttons/CustomButton";
import Field from "../../../../../../../components/Forms/Field";

import { apiRequest } from "../../../../../../../services/apiBinding";

const RelationForm = ({
  fields,
  workflowId,
  editRelation,
  onCancel,
  onSuccess,
  entityCodeId,
}) => {
  const queryClient = useQueryClient();
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      parentFieldDefinitionId: editRelation?.parentFieldId
        ? {
            label: editRelation?.parentFieldName,
            value: editRelation?.parentFieldId,
          }
        : "",
      childfieldDefinitionId: editRelation?.chieldFieldId
        ? {
            label: editRelation?.chieldFieldName,
            value: editRelation?.chieldFieldId,
          }
        : "",
    },
  });

  const selectedParent = watch("parentFieldDefinitionId");

  /* ---------------- FIELD OPTIONS ---------------- */

  // const parentFieldOptions = useMemo(() => {
  //   return (
  //     fields
  //       ?.filter((f) => ["select", "multiselect", "customselect", "selectoperator"].includes(f.type))
  //       ?.map((f) => ({
  //         label: f.name,
  //         value: f.fieldDefinitionId,
  //       })) || []
  //   );
  // }, [fields]);

  const childFieldOptions = useMemo(() => {
    return (
      fields
        ?.filter(
          (f) =>
            [
              "select",
              "multiselect",
              "customselect",
              "selectoperator",
            ].includes(f.type) && f.fieldDefinitionId !== selectedParent,
        )
        ?.map((f) => ({
          label: f.name,
          value: f.fieldDefinitionId,
        })) || []
    );
  }, [fields, selectedParent]);

  /* ---------------- SAVE MUTATION ---------------- */

  const saveRelationMutation = useMutation({
    mutationFn: (payload) =>
      apiRequest({
        apiPath: "WorkflowRelation",
        method: editRelation ? "patch" : "post",
        payload,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["workflowRelations", workflowId],
      });

      onSuccess?.();
    },
  });

  /* ---------------- SUBMIT ---------------- */

  const onSubmit = (data) => {
    const payload = {
      id: editRelation?.id ?? null,
      workFlowId: workflowId,
      parentFieldDefinitionId: data?.parentFieldDefinitionId?.value,
      childfieldDefinitionId: data?.childfieldDefinitionId?.value,
      relationTypeId: 1,
    };

    saveRelationMutation.mutate(payload);
  };

  /* ---------------- UI ---------------- */

  return (
    <form
      className="flex flex-col gap-4 p-4 max-w-xl"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h3 className="text-sm font-semibold">
        {editRelation ? "Edit Relation" : "Add Relation"}
      </h3>

      {/* Parent Field */}

      <Field
        controller={{
          name: "parentFieldDefinitionId",
          control,
          rules: { required: "Parent field is required" },
          render: ({ field }) => (
            <SelectField
              {...field}
              label="Parent Field"
              // defaultOptions={parentFieldOptions}
              isRelation={true}
              payload={{
                dataTable: "ctWorkflowFieldDefination",
                dataField: "name",
                relationId: entityCodeId,
                entityId: workflowId,
              }}
              isRequired
              invalid={errors?.parentFieldDefinitionId}
            />
          ),
        }}
      />

      {/* Child Field */}

      <Field
        controller={{
          name: "childfieldDefinitionId",
          control,
          rules: { required: "Child field is required" },
          render: ({ field }) => (
            <SelectField
              {...field}
              label="Child Field"
              defaultOptions={childFieldOptions}
              isRequired
              isDisabled={!selectedParent}
              invalid={errors?.childfieldDefinitionId}
            />
          ),
        }}
      />

      {/* Buttons */}

      <div className="flex gap-3 mt-2">
        <CustomButton
          className="outlineBtn"
          label="CANCEL"
          onClick={onCancel}
        />

        <CustomButton
          className="saveBtn"
          // label="SAVE VALIDATION"
          label={
            saveRelationMutation.isLoading
              ? "Saving..."
              : editRelation
                ? "Update Relation"
                : "Save Relation"
          }
          // onClick={handleSubmit(submitForm)}
        />
        {/* <CustomButton type="button" label="Cancel" onClick={onCancel} /> */}
        {/* <CustomButton className="saveBtn" type="submit" /> */}
      </div>
    </form>
  );
};

export default RelationForm;
