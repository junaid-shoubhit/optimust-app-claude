import { useState, useMemo, useCallback, useEffect } from "react";
import FormModal from "../FormModal";
import { useNavigate } from "react-router-dom";
import NoTabsForm from "../../NoTabsForm/NoTabsForm";
import TabsForm from "../../TabsForm/TabsForm";
import { useNoTabFormData } from "../../NoTabsForm/hooks/useNoTabFormData";
import classNames from "classnames";
import { NoTabSkeleton } from "../../NoTabsForm/NoTabSkeleton";

const StepModal = ({
  initialStep = 1,
  details,
  visible,
  setVisible,
  isNoModal,
  id = 0,
  rowIndex,
  moduleId,
  title,
  widthConfig,
  designType = "tabs-hybrid-contacts",
  queryKeys,
  tabQueryKey,
  entityCode,
  entityCodeId,
  entityParentId,
  StepOneComponent,
  SidebarComponent,
  isMassUpdate,
  selectedMassIds,
  selectedTab,
  tabs,
  onClose,
  colSize,
  ...rest
}) => {
  const navigate = useNavigate();

  const [step, setStep] = useState(initialStep);
  const [entityId, setEntityId] = useState(id);
  const [dataState, setDataState] = useState(details);
  const [dynamicColSize, setDynamicColSize] = useState(1);

  const handleDynamicColSizeChange = useCallback((newColSize) => {
    setDynamicColSize((prev) => Math.max(prev, newColSize));
  }, []);
  console.log("dynamicColSize", dynamicColSize);
  /* ---------------- FETCH ---------------- */
  const shouldFetch =
    initialStep === 1 &&
    entityCodeId &&
    !["tabs-hybrid-contacts", "no-tabs-static"].includes(designType);

  const { fieldData, dynamicValues, isLoading, isReady, isError, error } =
    useNoTabFormData(
      {
        entityId,
        entityCodeId,
        moduleId,
        isParent: Boolean(entityParentId),
        tabName: "No Tab",
        prefillValues: details?.prefillValues,
      },
      { enabled: Boolean(shouldFetch) },
      designType,
    );
  /* ---------------- LAYOUT ---------------- */
  const layoutConfig = useMemo(() => {
    if (colSize) {
      return {
        colSize,
      };
    } else {
      const length =
        (fieldData?.fieldDefinitions?.length || 0) +
        (fieldData?.multipleFieldDefinitions?.length || 0);

      const initialColSize = Math.min(3, Math.max(1, Math.ceil(length / 5)));

      const colSize = Math.max(initialColSize, dynamicColSize);

      const widthMap = {
        1: "33vw",
        2: "45vw",
        3: "55vw",
      };

      return {
        colSize,
        width: widthMap[colSize] || "75vw",
      };
    }
  }, [fieldData, dynamicColSize, colSize]);

  /* ---------------- RESET + CLOSE ---------------- */
  const resetState = useCallback(() => {
    setStep(1);
    setEntityId(null);
    setDataState(null);
    setDynamicColSize(1);
  }, []);

  const handleClose = useCallback(
    (newId) => {
      if (onClose) {
        onClose(newId);
      } else if (
        (designType === "tabs-nested-dynamic" && newId) ||
        (designType.includes("contacts") && newId)
      ) {
        navigate(`overview?id=${newId}`, { replace: true });
      } else if (designType === "tabs-dynamic-edit") {
        navigate("..", {
          replace: true,
          relative: "path",
        });
      }

      resetState();
      if (!isNoModal) setVisible(false);
    },
    [designType, navigate, resetState, setVisible, onClose, isNoModal],
  );

  /* ---------------- STEP 1 PROPS ---------------- */

  /* ---------------- STEP 2 PROPS ---------------- */
  // const stepTwoProps = {
  //   entityId,
  //   setStep,
  //   handleClose,
  // };

  /* ---------------- STEP 1 ---------------- */
  const StepOne = useMemo(() => {
    const stepOneProps = {
      setStep,
      setEntityId,
      handleClose,
      setVisible,
      id,
      designType,
      moduleId,
      setData: setDataState,
      details: dataState,
      queryKeys,
      tabQueryKey,
      // editQueryKey: ["notab-dynamic", entityId, entityCodeId],
      rowIndex,
      entityCodeId,
      entityId,
      onColSizeChange: handleDynamicColSizeChange,
      ...rest,
    };

    if (StepOneComponent) {
      return <StepOneComponent {...stepOneProps} />;
    }

    return (
      <NoTabsForm
        {...stepOneProps}
        entityCode={entityCode}
        entityParentId={entityParentId}
        fieldData={fieldData}
        dynamicValues={dynamicValues}
        isLoading={isLoading}
        isError={isError}
        error={error}
        colSize={layoutConfig.colSize}
      />
    );
  }, [
    StepOneComponent,
    setStep,
    setEntityId,
    handleClose,
    setVisible,
    id,
    designType,
    moduleId,
    setDataState,
    dataState,
    queryKeys,
    rowIndex,
    entityCodeId,
    entityId,
    rest,
    entityCode,
    entityParentId,
    fieldData,
    dynamicValues,
    isLoading,
    isError,
    error,
    layoutConfig,
    tabQueryKey,
    handleDynamicColSizeChange,
  ]);

  /* ---------------- STEP 2 ---------------- */
  const StepTwo = useMemo(() => {
    if (
      !isMassUpdate &&
      (designType === "no-tabs" || designType === "no-tabs-card")
    )
      return null;
    if (!isMassUpdate && designType === "tabs-nested-dynamic") return null;
    return (
      <TabsForm
        entityId={entityId}
        setStep={setStep}
        handleClose={handleClose}
        data={designType === "tabs-hybrid-contacts" ? dataState : null}
        designType={designType}
        entityCode={entityCode}
        entityCodeId={entityCodeId}
        moduleId={moduleId}
        isMassUpdate={isMassUpdate}
        SidebarComponent={SidebarComponent}
        selectedMassIds={selectedMassIds}
        {...(selectedTab && { selectedTab })}
        {...(tabs && { tabs })}
      />
    );
  }, [
    designType,
    entityId,
    setStep,
    handleClose,
    isMassUpdate,
    dataState,
    entityCode,
    entityCodeId,
    SidebarComponent,
    selectedTab,
    tabs,
    moduleId,
    selectedMassIds,
  ]);

  /* ---------------- WIDTH ---------------- */
  const dynamicStyle = useMemo(() => {
    const base = { transition: "all 0.3s ease" };

    if (widthConfig?.[step]) {
      return { ...widthConfig[step], ...base };
    }

    if (step === 1) {
      return { width: layoutConfig.width, maxHeight: "80vh", ...base };
    }

    if (step === 2) {
      return { width: "75vw", minHeight: "60vh", ...base };
    }

    return base;
  }, [step, widthConfig, layoutConfig]);

  /* ---------------- RENDER ---------------- */
  return designType === "tabs-dynamic-edit" || isNoModal ? (
    step === 1 ? (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          maxHeight: "90vh",
          minHeight: 0,
          background: "white",
        }}
      >
        {isLoading || !isReady ? (
          <NoTabSkeleton colSize={layoutConfig?.colSize} />
        ) : (
          StepOne
        )}
      </div>
    ) : (
      <>No Found</>
    )
  ) : (
    <FormModal
      className={classNames(step === 2 && "tabs-form")}
      title={
        <>
          <p className="font-bold tracking-wider ">
            {isMassUpdate ? "Mass Update" : entityId ? "Edit" : "New"} {title}
          </p>
          <p className="text-xs text=[#FFFFFFBF]">
            {" "}
            Fill in the details to{" "}
            {isMassUpdate
              ? "Mass Update"
              : entityId || id
                ? "edit a"
                : "create a new"}{" "}
            {title}
          </p>
        </>
      }
      visible={visible}
      setVisible={setVisible}
      style={dynamicStyle}
    >
      {step === 1 &&
        (!isLoading ? (
          StepOne
        ) : (
          <NoTabSkeleton colSize={layoutConfig?.colSize} />
        ))}
      {step === 2 && StepTwo}
    </FormModal>
  );
};

export default StepModal;
