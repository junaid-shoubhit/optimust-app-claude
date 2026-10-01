import { useMemo } from "react";

import SelectField from "../../../../components/Forms/Select/Select";
import Input from "../../../../components/Forms/Input/Input";
import CustomCheckBox from "../../../../components/Forms/Checkbox/CustomCheckBox";

export const useWorkflowFormFields = ({
  isEdit,
  formTypePayload,
  workflowTypeId,
  relationWorkflowPayload,
  cascadeData,
  tabPayloadWithSelection,
  isTabDisabled,
  isTabNameDisabled,
  parentWorkflow,
  isImport,
}) =>
  useMemo(() => {
    const cascadeFields = (cascadeData?.options ?? []).map((item, index) => ({
      name: `workflowTypeMapping.${index}.value`,
      label: item.label,
      component: SelectField,

      rules:
        index === 0
          ? {
              validate: (_value, formValues) => {
                const mappings = formValues.workflowTypeMapping || [];

                const hasSelectedValue = mappings.some((field) =>
                  Array.isArray(field?.value)
                    ? field.value.length > 0
                    : !!field?.value,
                );

                return (
                  !parentWorkflow?.length ||
                  hasSelectedValue ||
                  "Select at least one relation fields Value"
                );
              },
            }
          : undefined,

      props: {
        isMulti: true,
        selecthMaxHeight: "50px",

        payload: {
          dataTable: item.dropdownTableName,
          dataField: item.dropdownColumnName,
          searchTerm: "",
        },
      },
    }));

    return [
      {
        name: "workflowTypeId",
        label: "Form Name",
        component: SelectField,

        rules: {
          required: "Form Name is required",
        },

        props: {
          isRelation: true,
          selecthMaxHeight: "50px",
          isRequired: true,
          disabled: isEdit,

          payload: {
            ...formTypePayload,
            selectedValue: workflowTypeId,
          },
        },
      },

      {
        name: "name",
        label: "Workflow Name",
        component: Input,

        rules: {
          required: "Workflow Name is required",
        },

        props: {
          isRequired: true,
        },
      },

      /**
       * UPDATED:
       * Relation Workflow is now MULTI SELECT.
       */
      {
        name: "parentWorkflows",
        label: "Relation Workflow",
        component: SelectField,

        props: {
          isRelation: true,
          isMulti: true,
          selecthMaxHeight: "50px",

          payload: {
            ...relationWorkflowPayload,

            /**
             * If SelectField itself expects the selected
             * values as comma-separated values, make sure
             * workflowTypeId is also converted accordingly.
             *
             * Usually workflowTypeId is a single value,
             * so this remains as it is.
             */
            selectedValue: workflowTypeId,
          },
        },
      },

      ...cascadeFields,

      {
        name: "tabId",
        label: "Tab",
        component: SelectField,

        rules: {
          required: "Tab is required",
        },

        props: {
          isRelation: true,
          payload: tabPayloadWithSelection,
          disabled: isTabDisabled,
          isRequired: true,
          cacheOptions: false,
        },
      },

      {
        name: "tabName",
        label: "Tab Name",
        component: Input,

        rules: {
          required: "Tab Name is required",
        },

        props: {
          isRequired: true,
          disabled: isTabNameDisabled,
        },
      },

      {
        name: "isActive",
        label: "is Active",

        customRender: ({ field, ...rest }) => (
          <div className="flex h-full">
            <CustomCheckBox {...field} {...rest} />
          </div>
        ),
      },
      ...(isImport
        ? [
            {
              name: "isImport",
              label: "Import Previous Tabs Data?",
              customRender: ({ field, ...rest }) => (
                <div className="flex h-full">
                  <CustomCheckBox {...field} {...rest} />
                </div>
              ),
            },
          ]
        : []),
    ];
  }, [
    formTypePayload,
    workflowTypeId,
    tabPayloadWithSelection,
    isTabDisabled,
    isTabNameDisabled,
    cascadeData?.options,
    relationWorkflowPayload,
    isEdit,
    parentWorkflow,
    isImport,
  ]);
