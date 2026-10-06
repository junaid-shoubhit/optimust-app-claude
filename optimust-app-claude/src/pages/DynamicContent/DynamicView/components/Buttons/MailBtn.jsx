import { useState } from "react";
import CustomButton from "../../../../../components/Forms/Buttons/CustomButton";
import StepModal from "../../../../../components/Modal/StepModal/StepModal";
import SendEmailSMSForm from "../../../../Forms/MailSMSForm/SendEmailSMSForm";

const MailBtn = ({
  entityId,
  caseData,
  activeMenu,
  noLabel,
  rowDetails = {},
}) => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <CustomButton
        label={noLabel ? null : "Mail"}
        icon={"pi pi-envelope"}
        iconPos={"left"}
        onClick={() => {
          setVisible(true);
        }}
        className={
          noLabel
            ? "w-7.5! border-none! p-button-sm bg-(--background-secondary)! p-0!"
            : "p-button-sm primary"
        }
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
            ...rowDetails,
          }}
        />
      )}
    </>
  );
};

export default MailBtn;
