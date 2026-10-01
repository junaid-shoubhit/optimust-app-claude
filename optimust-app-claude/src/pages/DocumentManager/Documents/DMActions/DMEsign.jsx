import React, { useState } from "react";
import { PiSignatureLight } from "react-icons/pi";
import SendEmailSMSForm from "../../../Forms/MailSMSForm/SendEmailSMSForm";
import StepModal from "../../../../components/Modal/StepModal/StepModal";

const DMEsign = ({ selectedFile, parentEntityId }) => {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <li>
        <button
          onClick={() => {
            setVisible(true);
          }}
          className="text-sm w-full text-left px-3 py-1 rounded text-blue-600 hover:bg-gray-100 flex items-center gap-2"
        >
          <PiSignatureLight size={14} /> E-Sign
        </button>
      </li>
      {visible && (
        <StepModal
          visible={visible}
          setVisible={setVisible}
          id={selectedFile?.caseId}
          parentEntityId={parentEntityId}
          title="Email Templates"
          widthConfig={{
            1: { width: "70vw" },
          }}
          entityCode="emailTemplates"
          //   entityCodeId={activeMenu?.entityCodeId}
          colSize={3}
          // details={details}
          designType={"no-tabs-static"}
          StepOneComponent={SendEmailSMSForm}
          // ❌ removed stepOnePropsMapper
          details={{
            esign: true,
            entityCodeId: selectedFile?.entityCodeId,
            documentId: {
              label: selectedFile?.fileName,
              value: selectedFile?.imageId,
            },
          }}
        />
      )}
    </>
  );
};

export default DMEsign;
