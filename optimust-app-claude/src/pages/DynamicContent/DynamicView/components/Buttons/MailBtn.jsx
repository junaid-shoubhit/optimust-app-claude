import { useState } from "react";
import CustomButton from "../../../../../components/Forms/Buttons/CustomButton";
import StepModal from "../../../../../components/Modal/StepModal/StepModal";
import SendEmailSMSForm from "../../../../Forms/MailSMSForm/SendEmailSMSForm";

const MailBtn = ({ entityId, caseData, activeMenu }) => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <CustomButton
        label={"Mail"}
        icon={"pi pi-envelope"}
        iconPos={"left"}
        onClick={() => {
          setVisible(true);
        }}
        className="p-button-sm primary"
      />

      {visible && (
        <StepModal
          visible={visible}
          setVisible={setVisible}
          id={entityId}
          title="Email Templates"
          widthConfig={{
            1: { width: "70vw" },
          }}
          entityCode="emailTemplates"
          // entityCodeId={activeMenu?.entityCodeId}
          colSize={3}
          // details={details}
          designType={"no-tabs-static"}
          StepOneComponent={SendEmailSMSForm}
          // ❌ removed stepOnePropsMapper
          activeMenu={activeMenu}
          details={{
            caseId: caseData,
            entityCodeId: activeMenu?.entityCodeId,
          }}
        />
      )}
    </>
  );
};

export default MailBtn;
