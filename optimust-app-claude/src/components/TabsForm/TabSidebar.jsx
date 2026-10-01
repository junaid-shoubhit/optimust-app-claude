import CustomButton from "../../components/Forms/Buttons/CustomButton";
import EntityList from "../Common/KeyValueList/EntityList";
import { useNoTabFormData } from "../NoTabsForm/hooks/useNoTabFormData";

const TabSidebar = ({
  entityId,
  setStep,
  entityCode,
  entityCodeId, // ✅ REQUIRED
  moduleId,
  data,
  designType,
  ...rest
}) => {
  /* 🔥 FETCH ONLY WHEN NO DATA */

  const shouldFetch = !data && !!entityId;
  const { fieldData, dynamicValues, isLoading, isError, error } =
    useNoTabFormData(
      {
        entityId,
        entityCodeId,
        moduleId,
        tabName: "No Tab",
      },
      {
        enabled: shouldFetch, // ✅ CONTROL API
      },
      designType,
    );

  /* ✅ Decide source */
  const finalFieldData = fieldData;
  const finalDynamicValues = dynamicValues;
  const finalLoading = shouldFetch ? isLoading : false;
  const finalError = shouldFetch ? isError : false;
  const finalErrorMessage = shouldFetch ? error?.message : null;

  if (!entityId) return null;

  return (
    <div className="border-b-[0.5px] bg-(--background-heading) border-(--border-inverse) p-2 flex gap-3">
      <CustomButton
        // label="EDIT DETAILS"
        iconPos="left"
        text
        icon="pi pi-arrow-left"
        className="tracking-wide text-2xl! text-(--color-fontFive)! p-0! w-fit!"
        onClick={() => setStep(1)}
      />

      <div className="mt-2 w-full max-h-9 overflow-auto">
        {entityCodeId && (
          <EntityList
            fieldData={data || finalFieldData}
            dynamicValues={finalDynamicValues}
            isLoading={finalLoading}
            isError={finalError}
            errorMessage={finalErrorMessage}
            entityCode={entityCode}
            entityId={entityId}
            configKey={data ? entityCode : ""}
            variant="grid"
            columns={entityCode === "case" || entityCode === "user" ? 8 : 7}
            {...rest}
          />
        )}
      </div>
    </div>
  );
};

export default TabSidebar;
