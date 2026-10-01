// import { useMemo } from "react";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "../../../services/apiBinding";
import { createPayload } from "../../../utils/constants/formConstants";
import Field from "../../../components/Forms/Field";
import Input from "../../../components/Forms/Input/Input";
import SelectField from "../../../components/Forms/Select/Select";
import { FaChevronRight } from "react-icons/fa";
// import { loadOPSelectOptions } from "../../../utils/constant";
import { toast } from "react-toastify";

const SideOptionsForm = ({
  control,
  setSidebarOpen,
  watch,
  mode,
  errors,
  // firmId,
}) => {
  // const firmIds = firmId || watch?.("firmIds") || [];
  // const firmValues = useMemo(() => {
  //   if (!Array.isArray(firmIds)) return "";
  //   return firmIds.map((f) => f.value).join(",");
  // }, [firmIds]);
  // console.log("firmValues", firmValues);

  // const defaultCaseFolderIds = watch?.("defaultCaseFolderId") || [];

  const UnbindedCodes = watch("UnbindedCodes");
  const entityCodeValue =
    watch("EntityCodeId")?.value ?? watch("EntityCodeId") ?? "";
  const isDefaultCaseFolderDisabled = !entityCodeValue;

  // ------------------ DOCUMENT NODE ------------------
  const documentNodeQuery = useQuery({
    queryKey: ["documentNode", entityCodeValue],
    enabled: Boolean(entityCodeValue),
    queryFn: async () =>
      apiRequest({
        apiPath: "/DocumentNode",
        method: "get",
        apiClient: "dm",
        payload: {
          EntityCodeId: entityCodeValue,
        },
      }),
    select: (data) => {
      console.log("data", data);
      const rawOptions = Array.isArray(data?.data) ? data?.data : [];

      return rawOptions.map((item) => ({
        label: item?.CustomName || item?.Name || "",
        value: item?.Id ?? "",
        ...item,
      }));
    },
  });

  console.log("documentNodeQuery", documentNodeQuery);

  const documentNodeOptions = (documentNodeQuery.data ?? []).map((item) => ({
    ...item,
    value: item.id,
    label: item.name,
  }));

  console.log("documentNodeOptions", documentNodeOptions);

  //     return loadOPSelectOptions(
  //       `options/default-case-folders`,
  //       firmIds
  //         ? { firmIds: firmValues.join(","), searchTerm: "" }
  //         : { searchTerm: "" },
  //       v,
  //       { labelKey: "label", valueKey: "value" },
  //       "post"
  //     );
  //   },
  // };

  // const handleDisabledClick = (e) => {
  //   e.preventDefault();
  //   toast.error("Please Select Firms First.", {
  //     position: "top-right",
  //     autoClose: 2000,
  //     hideProgressBar: true,
  //   });
  // };

  return (
    <div className="bg-gray-50 h-fit rounded-lg px-4 py-8 border border-gray-200 lg:col-span-2 space-y-3 sticky top-12">
      <button
        type="button"
        onClick={() => setSidebarOpen(false)}
        className="absolute top-2 right-2 p-1 bg-gray-200 rounded-full hover:bg-gray-300 z-20"
      >
        <FaChevronRight />
      </button>

      {/* Name */}
      <Field
        controller={{
          name: "name",
          control,
          rules: {
            required: "Name is required.",
          },
          render: ({ field }) => (
            <Input
              type="text"
              invalid={errors?.name}
              {...field}
              label="Name"
              placeholder="Enter Name"
              disabled={mode === "edit" ? true : false}
              isRequired={true}
            />
          ),
        }}
      />

      <Field
        controller={{
          name: "EntityCodeId",
          control,
          rules: {
            required: "Entity Code is required",
          },
          render: ({ field }) => (
            <SelectField
              {...field}
              invalid={errors?.EntityCodeId}
              // key={
              //   Array.isArray(firmIds)
              //     ? firmIds.map((f) => f.value).join(",")
              //     : firmIds?.value
              // } // ensures re-render when firms change
              label="Entity Code"
              placeholder={
                "Select Entity Code"
                // firmIds?.length ? "Select Folder" : "Select Firm first"
              }
              // isDisabled={
              //   !firmIds ||
              //   (Array.isArray(firmIds) && firmIds.length === 0)
              // }
              payload={{
                dataTable: "ctEntityCodesTemplate",
                dataField: "name",
                searchTerm: "",
                // selectedValue: firmValues,
              }}
              // isRelation={true}
              isRequired={true}
            />
          ),
        }}
      />

      {/* Cost Type */}
      {mode === "DMTemplates" && (
        <Field
          controller={{
            name: "defaultCaseFolderId",
            control,
            render: ({ field }) => (
              <SelectField
                {...field}
                key={entityCodeValue || "entity-code-empty"}
                // key={
                //   Array.isArray(firmIds)
                //     ? firmIds.map((f) => f.value).join(",")
                //     : firmIds?.value
                // } // ensures re-render when firms change
                label="Default Case Folder"
                placeholder={"Select Folder"}
                disabled={isDefaultCaseFolderDisabled}
                payload={{
                  dataTable: "dmDefaultCaseFolders",
                  dataField: "name",
                  searchTerm: entityCodeValue,
                  // EntityCodeId: entityCodeValue,
                  // selectedValue: firmValues,
                }}

                // isDisabled={!firmIds || (Array.isArray(firmIds) && firmIds.length === 0)}
              />
            ),
          }}
        />
      )}

      {mode !== "DMTemplates" && (
        <>
          {/* <Field
            controller={{
              name: "userGroups",
              control,
              rules: {
                required: "Captions is required",
              },
              render: ({ field }) => (
                <SelectField
                  {...field}
                  label="User Groups"
                  placeholder="Select User Groups"
                  isViewAllEnabled={false}
                  isAllOptions={true}
                  fillterd
                  isMulti={true}
                  invalid={errors?.userGroups}
                  disabled={mode === "edit" ? true : false}
                  payload={{
                    dataTable: "usrUserGroups",
                    dataField: "name",
                    searchTerm: "",
                  }}
                />
              ),
            }}
          /> */}
          {/* Firms */}
          {/* <Field
            controller={{
              name: "firmIds",
              control,
              rules: {
                required: "Firms is required.",
              },
              render: ({ field }) => (
                <SelectField
                  {...field}
                  label="Firms"
                  placeholder="Select Firm"
                  isAllOptions={true}
                  isMulti={true}
                  payload={{
                    dataTable: "frmFirms",
                    dataField: "name",
                    searchTerm: "",
                  }}
                  invalid={errors?.firmIds}
                  disabled={mode === "edit" ? true : false}
                />
              ),
            }}
          /> */}

          {/* Default Case Folder */}
          <Field
            controller={{
              name: "defaultCaseFolderId",
              control,
              rules: {
                required: "Default Case Folder is required",
              },
              render: ({ field }) => (
                <SelectField
                  {...field}
                  invalid={errors?.defaultCaseFolderId}
                  key={entityCodeValue || "entity-code-empty"}
                  // key={
                  //   Array.isArray(firmIds)
                  //     ? firmIds.map((f) => f.value).join(",")
                  //     : firmIds?.value
                  // } // ensures re-render when firms change
                  label="Default Case Folder"
                  placeholder={
                    "Select Folder"
                    // firmIds?.length ? "Select Folder" : "Select Firm first"
                  }
                  defaultOptions={documentNodeOptions}
                  disabled={
                    !entityCodeValue && documentNodeOptions.length === 0
                  }
                  // isDisabled={
                  //   !firmIds ||
                  //   (Array.isArray(firmIds) && firmIds.length === 0)
                  // }
                  // isRelation={true}
                  isRequired={true}
                />
              ),
            }}
          />

          {/* <Field
            controller={{
              name: "costTypeId",
              control,
              rules: {
                required: "Cost Type is required",
              },
              render: ({ field }) => (
                <SelectField
                  {...field}
                  invalid={errors?.costTypeId}
                  label="Cost Type"
                  placeholder="Select Cost Type"
                  payload={{
                    dataField: "name",
                    dataTable: "finCostTypes_Options",
                  }}
                  isRequired={true}
                />
              ),
            }}
          /> */}

          {/* <Field
            controller={{
              name: "captionOptionId",
              control,
              rules: {
                required: "Captions is required",
              },

              render: ({ field }) => (
                <SelectField
                  {...field}
                  invalid={errors?.captionOptionId}
                  label="Captions"
                  placeholder="Select Caption"
                  isViewAllEnabled={false}
                  payload={{
                    dataTable: "dmTemplatesBeforeGenerateOptions",
                    dataField: "name",
                    searchTerm: "",
                  }}
                  isRequired={true}
                />
              ),
            }}
          /> */}

          {[
            // { name: "updateClusterStatus", label: "Update Cluster Status" },
            // { name: "clusterExhibits", label: "Cluster Exhibits" },
            // { name: "isRetainer", label: "Is Retainer" },
            { name: "isActive", label: "Is Active" },
            // {
            //   name: "settledStatusOption",
            //   label: "Can be generated in Settled case status",
            // },
            // {
            //   name: "discontinuedStatusOption",
            //   label: "Can be generated in Discontinued case status",
            // },
            { name: "hasSignature", label: "Has Signature" },
            { name: "omitExhibits", label: "Omit Exhibits" },
          ].map((item) => (
            <Field
              key={item.name}
              controller={{
                name: item.name,
                control,
                render: ({ field }) => (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      {...field}
                      checked={field.value || false}
                      className="min-h-4 min-w-4"
                    />
                    <label className="text-sm font-medium">{item.label}</label>
                  </div>
                ),
              }}
            />
          ))}
        </>
      )}
      {UnbindedCodes?.length > 0 && (
        <div className="bg-gray-50 mt-4 border border-red-300 p-3 rounded">
          <p className="font-semibold text-red-600 mb-3">
            Unbinded Merge Codes
          </p>

          {UnbindedCodes.map((label, index) => (
            <Field
              key={index}
              controller={{
                name: `UnbindedValues.${index}`,
                control,
                rules: { required: "Value is required" },
                render: ({ field }) => (
                  <div className="mb-2">
                    <label className="block text-sm font-medium text-gray-800 mb-1">
                      {label}
                    </label>
                    <input
                      type="text"
                      {...field}
                      placeholder="Enter value"
                      className="border px-2 py-1 rounded w-full"
                      onChange={(e) => {
                        field.onChange(e.target.value);
                      }}
                    />
                  </div>
                ),
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SideOptionsForm;
