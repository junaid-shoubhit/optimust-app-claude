import React, { useState } from "react";

const AllCasesTableView = ({ filesToRender = [], setSelectedCase }) => {
  const [selectedCaseIds, setSelectedCaseIds] = useState([]);

  // Always make sure filesToRender is an array
  const safeFiles = Array.isArray(filesToRender) ? filesToRender : [];

  const toggleSelect = (file) => {
    try {
      if (!file || file.caseId === undefined || file.caseId === null) {
        return;
      }

      setSelectedCaseIds((prev) => {
        const currentIds = Array.isArray(prev) ? prev : [];

        let updated;

        if (currentIds.includes(file.caseId)) {
          updated = currentIds.filter((id) => id !== file.caseId);
        } else {
          updated = [...currentIds, file.caseId];
        }

        // Update parent safely
        if (typeof setSelectedCase === "function") {
          setSelectedCase((prevState) => ({
            ...(prevState || {}),
            allCases: {
              ...((prevState && prevState.allCases) || {}),
              selectedCaseIds: updated,
            },
          }));
        }

        return updated;
      });
    } catch (error) {
      console.error("Error while selecting case:", error);
    }
  };

  const isSelected = (file) => {
    try {
      if (!file || file.caseId === undefined || file.caseId === null) {
        return false;
      }

      return selectedCaseIds.includes(file.caseId);
    } catch (error) {
      console.error("Error checking case selection:", error);
      return false;
    }
  };

  const handleSelectAll = () => {
    try {
      if (!safeFiles.length) {
        setSelectedCaseIds([]);

        if (typeof setSelectedCase === "function") {
          setSelectedCase((prevState) => ({
            ...(prevState || {}),
            allCases: {
              ...((prevState && prevState.allCases) || {}),
              selectedCaseIds: [],
            },
          }));
        }

        return;
      }

      const allIds = safeFiles
        .filter(
          (file) => file && file.caseId !== undefined && file.caseId !== null,
        )
        .map((file) => file.caseId);

      if (selectedCaseIds.length === allIds.length) {
        // Unselect all
        setSelectedCaseIds([]);

        if (typeof setSelectedCase === "function") {
          setSelectedCase((prevState) => ({
            ...(prevState || {}),
            allCases: {
              ...((prevState && prevState.allCases) || {}),
              selectedCaseIds: [],
            },
          }));
        }
      } else {
        // Select all
        setSelectedCaseIds(allIds);

        if (typeof setSelectedCase === "function") {
          setSelectedCase((prevState) => ({
            ...(prevState || {}),
            allCases: {
              ...((prevState && prevState.allCases) || {}),
              selectedCaseIds: allIds,
            },
          }));
        }
      }
    } catch (error) {
      console.error("Error while selecting all cases:", error);
    }
  };

  const allSelected =
    safeFiles.length > 0 && selectedCaseIds.length === safeFiles.length;

  return (
    <table className="text-sm w-full border-collapse bg-white rounded-lg shadow-sm">
      <thead>
        <tr className="bg-gray-100 text-left">
          <th className="p-2 border-b w-10 text-center">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
            />
          </th>

          <th className="p-2 border-b">Case Name</th>
          <th className="p-2 border-b">Case No</th>
          <th className="p-2 border-b">Client Name</th>
          <th className="p-2 border-b">Status</th>
          <th className="p-2 border-b">Matter Type</th>
        </tr>
      </thead>

      <tbody>
        {safeFiles.length > 0 ? (
          safeFiles.map((file, index) => {
            // Prevent a broken/null item from crashing the page
            if (!file || typeof file !== "object") {
              return null;
            }

            return (
              <tr
                key={file.caseId ?? `case-${index}`}
                onClick={() => toggleSelect(file)}
                className={`cursor-pointer border-b transition-all duration-200 ease-in-out ${
                  isSelected(file)
                    ? "bg-blue-100 shadow-inner"
                    : "hover:bg-gray-50 hover:shadow-sm"
                }`}
              >
                <td className="p-2 text-center">
                  <input
                    type="checkbox"
                    checked={isSelected(file)}
                    onChange={() => toggleSelect(file)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>

                <td className="p-2 font-medium">{file.caseName ?? "-"}</td>

                <td className="p-2">{file.caseNumber ?? "-"}</td>

                <td className="p-2">{file.patientName ?? "-"}</td>

                <td className="p-2">{file.caseStatus ?? "-"}</td>

                <td className="p-2">{file.matterType ?? "-"}</td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan={6} className="p-4 text-center text-gray-500">
              No cases found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default AllCasesTableView;
