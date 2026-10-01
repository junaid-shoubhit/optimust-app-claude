import { useState } from "react";
import CustomButton from "../../../../../components/Forms/Buttons/CustomButton";
import StepModal from "../../../../../components/Modal/StepModal/StepModal";
import ViewExpenseSummary from "../../../../../pages/Cases/PI/PIDetails/Financials/Expenses/ViewExpenseSummary";
const ExpenseSummaryButton = ({ caseId }) => {
  console.log("props", { caseId });
  const [visible, setVisible] = useState(false);
  return (
    <>
      <CustomButton
        iconPos="left"
        label="Expense"
        icon="pi pi-file"
        className="outlineBtn"
        aria-label="Add"
        onClick={() => {
          setVisible(true);
        }}
      />

      {visible && (
        <StepModal
          visible={visible}
          setVisible={setVisible}
          id={0}
          title="Expense Status Summary"
          widthConfig={{
            1: { width: "60vw" },
            2: { width: "90vw", minHeight: "60vh" },
          }}
          entityCode="emailTemplates"
          // entityCodeId={activeMenu?.entityCodeId}
          colSize={3}
          // details={details}
          designType={"no-tabs-static"}
          StepOneComponent={() => (
            <ViewExpenseSummary caseId={caseId} setVisible={setVisible} />
          )}
          // ❌ removed stepOnePropsMapper
        />
      )}
    </>
  );
};

export default ExpenseSummaryButton;
