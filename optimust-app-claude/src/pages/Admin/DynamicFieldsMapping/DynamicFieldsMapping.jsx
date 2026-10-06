import { useState, useCallback, memo, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../services/apiBinding";
import { useForm, Controller, useWatch } from "react-hook-form";
import SelectField from "../../../components/forms/Select/Select";
import CustomToggle from "../../../components/forms/CustomToggle/CustomToggle.jsx";
import CheckMarkButton from "../../../components/forms/Buttons/CheckMarkButton/CheckMarkButton.jsx";
import CrossButton from "../../../components/forms/Buttons/CrossButton/CrossButton.jsx";
import { Check, X, Pencil, ArrowRight, ArrowRightLeft } from "lucide-react";
import { useAppNavigation } from "../../../navigation/NavigationContext";
import { toast } from "react-toastify";
// ─── Brand ────────────────────────────────────────────────────────────────
const BRAND_COLOR = "#5b5fc7";

// ─── Payloads ─────────────────────────────────────────────────────────────

const createPayload = (dataTable, dataField = "name") => ({
  dataTable,
  dataField,
  searchTerm: "",
});

const INTAKE_FIELD_PAYLOAD = createPayload("ctIntakeWorkFlowFields");
const CASE_FIELD_PAYLOAD = createPayload("ctCaseWorkFlowFields");

const ROW_GRID =
  "grid grid-cols-[200px_44px_200px_90px_130px_130px_40px_1fr] items-center gap-5";

const TABLE_GRID =
  "grid grid-cols-[200px_44px_200px_90px_130px_130px_140px_140px_40px_1fr] items-center gap-5";

const MappingForm = memo(
  ({ initialData, onSave, onCancel, submitLabel, isEditing }) => {
    const {
      handleSubmit,
      control,
      reset,
      setValue,
      formState: { errors },
    } = useForm({
      defaultValues: {
        intakeFieldId: initialData?.fromFieldDefinitionId
          ? {
              value: initialData.fromFieldDefinitionId,
              label: initialData.fromFieldName,
              type: initialData.type,
              tabTypeId: initialData.tabTypeId,
            }
          : null,

        caseFieldId: initialData?.toFieldDefinitionId
          ? {
              value: initialData.toFieldDefinitionId,
              label: initialData.toFieldName,
            }
          : null,

        isActive: initialData?.isActive ?? true,
      },
    });
    console.log("MappingForm initialData", initialData);

    const intakeFieldValue = useWatch({ control, name: "intakeFieldId" });

    const onSubmit = (values) => {
      onSave({
        intakeFieldId: values.intakeFieldId,
        caseFieldId: values.caseFieldId,
        isActive: values.isActive,
      });
      reset();
    };

    const handleCancel = () => {
      reset();
      onCancel?.();
    };

    return (
      <form onSubmit={handleSubmit(onSubmit)} className={ROW_GRID}>
        <Controller
          name="intakeFieldId"
          control={control}
          rules={{ required: "Required" }}
          render={({ field }) => (
            <SelectField
              {...field}
              label="Intake Field"
              payload={INTAKE_FIELD_PAYLOAD}
              error={errors.intakeFieldId?.message}
              onChange={(val) => {
                field.onChange(val);
                // Case field depends on intake field — reset it when intake changes.
                setValue("caseFieldId", null);
              }}
            />
          )}
        />

        {/* Conversion arrow — intake becomes a case field */}
        <div className="flex justify-center items-center">
          <div
            className="flex items-center justify-center h-8 w-8 rounded-full shrink-0"
            style={{ backgroundColor: `${BRAND_COLOR}1a`, color: BRAND_COLOR }}
            title="Maps to"
          >
            <ArrowRight size={18} strokeWidth={2.5} />
          </div>
        </div>

        <Controller
          name="caseFieldId"
          control={control}
          rules={{ required: "Required" }}
          render={({ field }) => (
            <SelectField
              {...field}
              label="Case Field"
              payload={{
                ...CASE_FIELD_PAYLOAD,
                selectedValue: intakeFieldValue?.type,
                entityId: intakeFieldValue?.tabTypeId,
              }}
              isRelation="true"
              error={errors.caseFieldId?.message}
              isDisabled={!intakeFieldValue}
            />
          )}
        />

        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <div className="flex justify-center pt-5">
              <CustomToggle
                value={field.value}
                onChange={(e) => field.onChange(e.value)}
              />
            </div>
          )}
        />

        {/* {isEditing && (
          <span className="text-xs text-gray-400 truncate pt-5">
            {initialData?.createdBy ?? "-"}
          </span>
        )}
        {isEditing && (
          <span className="text-xs text-gray-400 truncate pt-5">
            {initialData?.updatedBy ?? "-"}
          </span>
        )} */}

        <div className="flex items-center gap-2 pt-5">
          <CheckMarkButton
            type="submit"
            aria-label={submitLabel}
            title={submitLabel}
          />
          <CrossButton
            onClick={handleCancel}
            aria-label="Cancel"
            title="Cancel"
          />
        </div>

        <div />
      </form>
    );
  },
);

// ─── MappingRow — read view + on-the-spot edit toggle ────────────────────────

const MappingRow = memo(({ mapping, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isEditing) {
    return (
      <div className="px-3 py-2 border-b border-gray-100 last:border-b-0 bg-[#5b5fc7]/[0.03]">
        <MappingForm
          initialData={mapping}
          submitLabel="Save"
          onSave={(updated) => {
            onEdit(mapping.id, updated);
            setIsEditing(false);
          }}
          onCancel={() => setIsEditing(false)}
          isEditing={true}
        />
      </div>
    );
  }

  return (
    <div
      onDoubleClick={() => setIsEditing(true)}
      className={`${TABLE_GRID} px-3 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50/70 transition-colors group cursor-pointer`}
    >
      <span className="text-xs font-medium text-gray-700 truncate">
        {mapping?.fromFieldName}
      </span>

      <div className="flex justify-center">
        <div
          className="flex items-center justify-center h-7 w-7 rounded-full shrink-0 transition-transform group-hover:scale-110"
          style={{ backgroundColor: `${BRAND_COLOR}1a`, color: BRAND_COLOR }}
        >
          <ArrowRight size={16} strokeWidth={2.5} />
        </div>
      </div>

      <span className="text-xs font-medium text-gray-700 truncate">
        {mapping?.toFieldName}
      </span>

      <div className="flex justify-center">
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
            mapping?.isActive
              ? "bg-emerald-50 text-emerald-600"
              : "bg-gray-100 text-gray-400"
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              mapping?.isActive ? "bg-emerald-500" : "bg-gray-400"
            }`}
          />
          {mapping?.isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <span className="text-xs text-gray-500 truncate">
        {mapping?.createdBy ?? "—"}
      </span>

      <span className="text-xs text-gray-500 truncate">
        {mapping?.modifiedBy ?? "—"}
      </span>

      <span className="text-xs text-gray-500 truncate">
        {mapping?.created
          ? new Date(mapping.created).toLocaleDateString()
          : "-"}
      </span>

      <span className="text-xs text-gray-500 truncate">
        {mapping?.modified
          ? new Date(mapping.modified).toLocaleDateString()
          : "-"}
      </span>

      <div className="flex items-center">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="flex items-center justify-center text-gray-400 hover:text-blue-600 transition-colors"
          aria-label="Edit mapping"
          title="Edit"
        >
          <Pencil size={14} />
        </button>
      </div>

      <div />
    </div>
  );
});

// ─── Main DynamicFieldsMapping page ──────────────────────────────────────────

const DynamicFieldsMapping = () => {
  // const [mappings, setMappings] = useState(INITIAL_MAPPINGS_MOCK);
  // const isLoading = false; // remove once wired to useQuery's isLoading
  const { activeMenu } = useAppNavigation();
  console.log("Active menu in DynamicFieldsMapping:", activeMenu);

  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["dynamicFieldMappings", activeMenu?.id],
    queryFn: ({ signal }) =>
      apiRequest({
        apiPath: `/DynamicWorkflow/GetIntakeCaseFieldMapping/${activeMenu?.id}`,
        method: "get",
        // payload: { page: 1, pageSize: 100 },
        signal,
      }),
    enabled: true,
  });

  const mappings = useMemo(() => data?.data ?? [], [data]);
  console.log("mappings", mappings);

  const { mutate: addMapping } = useMutation({
    mutationFn: (form) =>
      apiRequest({
        apiPath: "/DynamicWorkflow/SaveIntakeCaseFieldMapping",
        method: "post",
        payload: {
          fromFieldDefinitionId: form.intakeFieldId?.value,
          toFieldDefinitionId: form.caseFieldId?.value,
          isActive: form.isActive,
          moduleId: activeMenu?.id,
        },
      }),
    onSuccess: (response) => {
      console.error("Error adding mapping:", response);
      if (response?.success === false) {
        toast.info(response?.message || "Operation could not be completed");
        return;
      }

      queryClient.invalidateQueries({
        queryKey: ["dynamicFieldMappings", activeMenu?.id],
      });
    },
  });

  const { mutate: editMapping } = useMutation({
    mutationFn: ({ id, form }) =>
      apiRequest({
        apiPath: "/DynamicWorkflow/SaveIntakeCaseFieldMapping",
        method: "post",
        payload: {
          id,
          fromFieldDefinitionId: form.intakeFieldId?.value,
          toFieldDefinitionId: form.caseFieldId?.value,
          isActive: form.isActive,
          moduleId: activeMenu?.id,
        },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["dynamicFieldMappings", activeMenu?.id],
      });
    },
  });

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleAdd = useCallback((form) => {
    addMapping(form);
  }, []);

  const handleEdit = useCallback((id, form) => {
    editMapping({ id, form });
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full pt-2 bg-[#fafafa]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3  shrink-0">
        <p className="text-sm font-bold uppercase text-(--color-fontFour)">
          Dynamic Fields Mapping
        </p>
      </div>

      {/* Add mapping — always open at the top */}
      <div className="px-4 py-3.5 border-b border-gray-200 bg-white shrink-0">
        <MappingForm submitLabel="Add" onSave={handleAdd} isEditing={false} />
      </div>

      {/* Mappings list */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {/* Column headers */}
          <div
            className={`${TABLE_GRID} px-3 py-3 bg-gray-50 border-b border-gray-200`}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Intake Field
            </span>
            <span />
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Case Field
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 text-center">
              Status
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Created By
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Updated By
            </span>

            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Created
            </span>

            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">
              Updated
            </span>

            <span />
            <span />
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <i className="pi pi-spin pi-spinner text-gray-400 text-xl" />
            </div>
          ) : mappings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-gray-400">
              <ArrowRightLeft size={28} strokeWidth={1.2} />
              <p className="text-xs font-medium">No field mappings yet</p>
              <p className="text-[11px]">
                Map your first intake field above to get started
              </p>
            </div>
          ) : (
            mappings?.map((mapping) => (
              <MappingRow
                key={mapping.id}
                mapping={mapping}
                onEdit={handleEdit}
              />
            ))
          )}
        </div>

        {/* Footer count */}
        {mappings?.length > 0 && (
          <p className="text-[10px] text-gray-400 mt-2 px-1">
            {mappings?.length} mapping{mappings?.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
};

export default DynamicFieldsMapping;
