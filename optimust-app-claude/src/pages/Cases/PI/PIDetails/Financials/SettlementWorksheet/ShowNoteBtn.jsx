import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import CustomButton from "../../../../../../components/Forms/Buttons/CustomButton";
import StepModal from "../../../../../../components/Modal/StepModal/StepModal";
import { apiRequest } from "../../../../../../services/apiBinding";

/* =========================================================
   NOTES TABLE COMPONENT
========================================================= */

const SettlementNotesTable = ({ caseId, setVisible }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["settlement-notes", caseId],
    queryFn: async () => {
      const response = await apiRequest({
        apiPath: "/settlementWorksheet/notes/" + caseId,
        method: "post",
        // payload: {
        //   page: 1,
        //   pageSize: 10,
        //   caseId,
        // },
        apiClient: "optimust",
      });

      return response?.data;
    },
    enabled: !!caseId,
  });

  const notes = data?.notes || [];

  return (
    <div className="bg-[#f8f8f8] rounded-md">
      {/* Header */}
      {/* <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-[20px] font-medium text-gray-800">
          Settlement Notes
        </h2>
      </div> */}

      {/* Body */}
      <div className="p-4">
        <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[#f7f4ef]">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-r border-gray-200 w-[220px]">
                  Subject
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-r border-gray-200">
                  Body
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-r border-gray-200 w-[120px]">
                  Type
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-r border-gray-200 w-[160px]">
                  Created
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-gray-200 w-[160px]">
                  Modified
                </th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : notes.length > 0 ? (
                notes.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 border-b border-r border-gray-100 text-gray-800 align-top">
                      {item.subject || "-"}
                    </td>

                    <td className="px-4 py-3 border-b border-r border-gray-100 text-gray-700 align-top max-w-[400px]">
                      <div
                        className="line-clamp-3"
                        dangerouslySetInnerHTML={{
                          __html: item.body || "-",
                        }}
                      />
                    </td>

                    <td className="px-4 py-3 border-b border-r border-gray-100 text-gray-700 align-top">
                      {item.type || "-"}
                    </td>

                    <td className="px-4 py-3 border-b border-r border-gray-100 text-gray-700 align-top whitespace-nowrap">
                      {item.created
                        ? new Date(item.created).toLocaleDateString()
                        : "-"}
                    </td>

                    <td className="px-4 py-3 border-b border-gray-100 text-gray-700 align-top whitespace-nowrap">
                      {item.modified
                        ? new Date(item.modified).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-gray-400">
                    No settlement notes available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-end mt-8">
          <CustomButton
            label="CLOSE"
            type="button"
            className="outlineBtn min-w-[100px]"
            onClick={() => setVisible(false)}
          />
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   BUTTON COMPONENT
========================================================= */

const ShowNoteBtn = ({ caseId }) => {
  const [visible, setVisible] = useState(false);

  return (
    <>


       <CustomButton
                iconPos="left"
                label="Notes"
                icon="pi pi-file"
                className="outlineBtn"
                aria-label="Add"
                   onClick={()=>{
            setVisible(true)
        }}
              />

      {visible && (
        <StepModal
          visible={visible}
          setVisible={setVisible}
          id={0}
          title="Settlement Notes"
          widthConfig={{
            1: { width: "75vw" },
          }}
          designType="no-tabs-static"
          StepOneComponent={() => (
            <SettlementNotesTable caseId={caseId} setVisible={setVisible} />
          )}
        />
      )}
    </>
  );
};

export default ShowNoteBtn;
