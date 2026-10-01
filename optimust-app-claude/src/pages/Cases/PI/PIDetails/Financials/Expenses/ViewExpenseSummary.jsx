import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import CustomButton from "../../../../../../components/Forms/Buttons/CustomButton";
import { apiRequest } from "../../../../../../services/apiBinding";

const ViewExpenseSummary = ({ caseId, setVisible }) => {
  
  console.log("caseId in summary", caseId);
  /* ------------------ API CALL ------------------ */
  const { data, isLoading } = useQuery({
    queryKey: ["expense-summary", caseId],
    queryFn: async () => {
      const response = await apiRequest({
        apiPath: "/expenses/page",
        method: "post",
        payload: {
          page: 1,
          pageSize: 3,
          caseId,
        },
        apiClient: "optimust",
      });

      return response;
    },
    enabled: !!caseId,
  });

  /* ------------------ SUMMARY ------------------ */
  const summaryRows = useMemo(() => {
    const expenses = data?.expenses || [];

    const grouped = expenses.reduce((acc, item) => {
      const status = item?.expenseStatusName || "Unknown";

      if (!acc[status]) {
        acc[status] = 0;
      }

      acc[status] += Number(item?.amount || 0);

      return acc;
    }, {});

    return Object.entries(grouped).map(([status, total], index) => ({
      srNo: index + 1,
      status,
      total,
    }));
  }, [data]);

  const totalAmount = data?.expenseAmountSum || 0;

  /* ------------------ JSX ------------------ */
  return (
    <div className="bg-[#f8f8f8] rounded-md">
      {/* Header */}
      {/* <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-[20px] font-medium text-gray-800">
          Expense Status Summary
        </h2>
      </div> */}

      {/* Body */}
      <div className="p-6">
        {isLoading ? (
          <div className="flex justify-center items-center py-16 text-gray-500">
            Loading...
          </div>
        ) : (
          <div className="space-y-6">
            {/* Main Table */}
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-[#f7f4ef]">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-r border-gray-200 w-[80px]">
                      S.No
                    </th>

                    <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-r border-gray-200">
                      Expense Status
                    </th>

                    <th className="px-4 py-3 text-right font-semibold text-gray-700 border-b border-gray-200 w-[150px]">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {summaryRows.map((row) => (
                    <tr
                      key={row.status}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 border-b border-r border-gray-100 text-gray-700">
                        {row.srNo}
                      </td>

                      <td className="px-4 py-3 border-b border-r border-gray-100 text-gray-800">
                        {row.status}
                      </td>

                      <td className="px-4 py-3 border-b border-gray-100 text-right font-medium text-gray-900">
                        ${Number(row.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}

                  {/* TOTAL ROW */}
                  <tr className="">
                    <td className="px-4 py-3 border-r border-gray-200 font-semibold text-gray-900">
                      {summaryRows.length + 1}
                    </td>

                    <td className="px-4 py-3 border-r border-gray-200 font-semibold text-gray-900">
                      TOTAL
                    </td>

                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      ${Number(totalAmount).toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Funding Source Table */}
              {/* <div className="bg-white border border-gray-200 rounded-md overflow-hidden">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-[#f7f4ef]">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-700 border-b border-r border-gray-200">
                        Funding Source
                      </th>

                      <th className="px-4 py-3 text-right font-semibold text-gray-700 border-b border-gray-200 w-[150px]">
                        Total
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    <tr>
                      <td className="px-4 py-4 text-gray-400">
                        No funding source available
                      </td>

                      <td className="px-4 py-4"></td>
                    </tr>
                  </tbody>
                </table>
              </div> */}
          </div>
        )}

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

export default ViewExpenseSummary;