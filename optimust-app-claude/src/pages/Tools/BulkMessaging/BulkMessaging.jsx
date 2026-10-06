import React, { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";

import CustomButton from "../../../components/Forms/Buttons/CustomButton";
import { apiRequest } from "../../../services/apiBinding";

import SendEmailSMSForm from "./../../../pages/Forms/MailSMSForm/SendEmailSMSForm";
import { useAppNavigation } from "../../../navigation/NavigationContext";
const BulkMessaging = () => {
  const [caseNumbers, setCaseNumbers] = useState("");
  const [verifiedCases, setVerifiedCases] = useState([]);
  const [formValues, setFormValues] = useState({});
  const emailFormRef = useRef(null);
  const { activeMenu } = useAppNavigation();

  const verifyMutation = useMutation({
    mutationFn: async (payload) => {
      return apiRequest({
        apiPath: "/case/bulk-messaging",
        method: "post",
        payload,
      });
    },

    onSuccess: (response) => {
      setVerifiedCases(response?.data || response || []);
    },
  });

  const sendMutation = useMutation({
    mutationFn: async ({ apiPath, payload }) => {
      return apiRequest({
        apiPath,
        method: "post",
        payload,
      });
    },
  });

  const getCaseNumbersPayload = () => {
    return caseNumbers
      .split(/[\n,]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .join(",");
  };

  const handleVerify = async () => {
    const payload = getCaseNumbersPayload();

    if (!payload) return;

    await verifyMutation.mutateAsync(payload);
  };

  const handleSend = async () => {
    let caseData = verifiedCases;

    if (!caseData.length) {
      const verifyResponse = await verifyMutation.mutateAsync(
        getCaseNumbersPayload(),
      );

      caseData = verifyResponse?.data || verifyResponse || [];
    }

    const isSmsMode = formValues?.type === "sms";

    const payload = isSmsMode
      ? {
          caseData,
          body: formValues?.body || "",
        }
      : {
          caseData,

          emailCc:
            formValues?.cc
              ?.map((item) => item?.label)
              .filter(Boolean)
              .join(",") || "",

          emailBcc:
            formValues?.bcc
              ?.map((item) => item?.label)
              .filter(Boolean)
              .join(",") || "",

          subject: formValues?.subject || "",

          body: formValues?.body || "",
        };

    const apiPath = isSmsMode
      ? "/utility/bulk-sms-messaging"
      : "/email/bulk-sending";

    await sendMutation.mutateAsync({ apiPath, payload });
  };

  return (
    <div className="flex flex-col gap-2">
      {/* FORM - FULL WIDTH */}
      <div className="rounded-3xl border border-gray-200 py-2 px-14">
        <SendEmailSMSForm
          id={activeMenu?.entityCodeId}
          ref={emailFormRef}
          activeMenu={activeMenu}
          hideSubmit
          onValuesChange={setFormValues}
          enableDocument={false}
        />
      </div>

      {/* CASES SECTION */}
      <div className="grid grid-cols-12 gap-4 px-8">
        {/* LEFT PANEL */}
        <div
          className="col-span-4 bg-white rounded-3xl border border-gray-200 p-4 flex flex-col"
          style={{ height: "50vh" }}
        >
          <label className="text-sm font-medium text-gray-700 mb-2">
            Case Numbers (Separate each case number with new line or comma)
          </label>

          <textarea
            rows={6}
            value={caseNumbers}
            onChange={(e) => setCaseNumbers(e.target.value)}
            className="w-full flex-1 border border-gray-300 rounded-xl p-3 resize-none focus:outline-none mb-2"
          />

          <div className="flex justify-end">
            <CustomButton
              type="button"
              label={verifyMutation.isPending ? "Verifying..." : "Verify Cases"}
              className="saveBtn"
              onClick={handleVerify}
              disabled={verifyMutation.isPending}
            />
          </div>
        </div>

        {/* VERIFIED CASES */}
        <div className="col-span-8 flex flex-col">
          <div className="bg-white rounded-3xl border border-gray-200 flex flex-col h-[50vh]">
            <div className="px-4 py-3 border-b bg-gray-50">
              <p className="text-sm font-bold uppercase text-(--color-fontFour)">
                Verified Cases
              </p>
            </div>

            <div className="flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0 [&_th]:font-normal">
                  <tr>
                    <th className="text-left px-4 py-3">Case No</th>
                    <th className="text-left px-4 py-3">Client Name</th>
                    <th className="text-left px-4 py-3">Email</th>
                    <th className="text-left px-4 py-3">Mobile</th>
                    <th className="text-left px-4 py-3">SMS Authorized</th>
                  </tr>
                </thead>

                <tbody>
                  {verifiedCases.map((item) => (
                    <tr key={item.caseId} className="border-t border-gray-100">
                      <td className="px-4 py-3">{item.caseNo}</td>

                      <td className="px-4 py-3">
                        {item.clientFirstName} {item.clientLastName}
                      </td>

                      <td className="px-4 py-3">{item.email || "-"}</td>

                      <td className="px-4 py-3">{item.phoneNumber || "-"}</td>

                      <td className="px-4 py-3">
                        {item.isSmsAuthorized ? "Yes" : "No"}
                      </td>
                    </tr>
                  ))}

                  {!verifiedCases.length && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-8 text-gray-500"
                      >
                        No verified cases found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SEND BUTTON */}
          <div className="flex justify-end mt-4 mb-4">
            <CustomButton
              label={
                sendMutation.isPending
                  ? "Sending..."
                  : formValues?.type === "sms"
                    ? "Send SMS"
                    : "Send Email"
              }
              className="saveBtn"
              onClick={handleSend}
              disabled={sendMutation.isPending}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkMessaging;
