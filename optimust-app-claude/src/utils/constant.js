// Dummy JSON data

import moment from "moment";
import { apiRequest } from "../services/apiBinding";

export const formatDateForm = (date, type = "date", isUTC = true) => {
  if (!date) {
    return null;
  }
  if (date === "current_date") {
    return new Date();
  }
  if (isUTC) {
    if (type === "date") {
      return moment.utc(date, "YYYY-MM-DD").local().toDate();
    }
    if (type === "datetime") {
      return moment.utc(date, "YYYY-MM-DD HH:mm:ss").local().toDate();
    }
  } else {
    if (type === "date") {
      return moment(date, "YYYY-MM-DD").toDate();
    }
    if (type === "datetime") {
      return moment(date, "YYYY-MM-DD HH:mm:ss").toDate();
    }
  }
};

export const formatDateUI = (date, type = "date", isUTC = true) => {
  if (type === "date") {
    if (isUTC) {
      const m = moment.utc(date).local();
      return m.isValid() ? m.format("MM/DD/YYYY") : "—";
    } else {
      const m = moment(date);
      return m.isValid() ? m.format("MM/DD/YYYY") : "—";
    }
  }
  if (type === "datetime") {
    if (isUTC) {
      const m = moment.utc(date).local();
      return m.isValid() ? m.format("MM/DD/YYYY hh:mm A") : "—";
    } else {
      const m = moment(date);
      return m.isValid() ? m.format("MM/DD/YYYY hh:mm A") : "—";
    }
  }

  return "—";
};

/* 🔥 Date formatter for PrimeReact */
export const formatDateForPrime = (value) => {
  if (!value) return null;

  return moment.utc(value, "YYYY-MM-DD").local().toDate();
};

export const formatDateTimeForPrime = (value) => {
  if (!value) return null;

  return moment.utc(value, "YYYY-MM-DD HH:mm:ss").local().toDate();
};

export const withOutUTCDate = (date) => {
  const m = moment(date).format("MM/DD/YYYY");
  return m;
};

export const withOutUTCDateTime = (date) => {
  const m = moment(date).format("MM/DD/YYYY HH:mm:ss");
  return m;
};

export const saveformatDate = (date, type) => {
  if (!date) return null;

  const selectedDate = moment(date);

  if (!selectedDate.isValid()) return null;

  // For date-only fields, attach the user's current local time
  // before converting to UTC
  if (type === "date") {
    const currentTime = moment();

    selectedDate.set({
      hour: currentTime.hour(),
      minute: currentTime.minute(),
      second: currentTime.second(),
      millisecond: currentTime.millisecond(),
    });
  }

  // For datetime, keep the originally selected date + time
  // Then convert both types from local time to UTC
  return selectedDate.utc().toISOString();
};

// export const formatDate = (date) => {
//   const m = moment.utc(date).local();
//   return m.isValid() ? m.format("MM/DD/YYYY") : "—";
// };

// export const formatDateTime = (dateTime) => {
//   const m = moment.utc(dateTime).local();
//   return m.isValid() ? m.format("MM/DD/YYYY hh:mm A") : "-";
// };

export const createFilterConfig = (
  type,
  table,
  field,
  showAll = false,
  isViewAllEnabled,
  isMulti,
  fetchSize = 20,
) => ({
  type,
  isViewAllEnabled,
  isMulti,
  payload: {
    dataTable: table,
    dataField: field,
    fetchSize,
    showAll,
  },
});

export const buildQueryString = (nodes) => {
  return nodes
    .filter((n) => n.field || n.type === "group") // ignore empty
    .map((node) => {
      if (node.type === "group") {
        const childQuery = buildQueryString(node.children);
        return childQuery ? `(${childQuery})` : "";
      }

      if (node.type === "condition" && node.field && node.operator) {
        const { operatorType, value, operator, field, fieldType } = node;

        const formatValue = (val) => {
          if (!val) return "";
          if (fieldType === "datetime") {
            // keep full datetime string
            return `'${new Date(val).toISOString().replace("T", " ").replace("Z", "")}'`;
          } else if (fieldType === "date") {
            // only date part
            return `'${new Date(val).toISOString().split("T")[0]}'`;
          }
          // normal value
          return typeof val === "string" && isNaN(val)
            ? `'${val}'`
            : `${new Date(val).toISOString().split("T")[0]}`;
        };

        // Handle operator types
        switch (operatorType) {
          case "textbox": {
            let val = value
              .split(",")
              .map((v) => `'${v}'`)
              .join(",");
            return `${field} ${operator.replace("#value", val)}`;
          }
          case "dropdowns": {
            const vals = (Array.isArray(value) ? value : [])
              .map((v) => v?.value ?? v)
              .filter(Boolean)
              .join(",");
            return `${field} in (${vals})`;
          }

          case "dropdown": {
            const val = value?.value ?? value ?? "";
            return `${field} = ${val}`;
          }

          case "betweentextbox": {
            const from = value?.from ?? "";
            const to = value?.to ?? "";
            const formattedFrom = formatValue(from);
            const formattedTo = formatValue(to);
            return `${field} between ${formattedFrom} and ${formattedTo}`;
          }

          case "NA":
            return `${field} ${operator}`;

          default: {
            const formattedVal = formatValue(value);
            return `${field} ${operator.replace("#value", formattedVal)}`;
          }
        }
      }
      return "";
    })
    .filter(Boolean)
    .join(` ${nodes[0]?.logic || "AND"} `);
};

// loadOptionsHelper.js
export const loadSelectOptions = async (
  apiPath,
  payload = {},
  inputValue = "",
  keyMap = {},
  method = "get",
  extraFields = [],
) => {
  try {
    const data = await apiRequest({
      apiPath,
      payload: { ...payload, searchTerm: inputValue },
      apiClient: "dm",
      method,
    });

    const { labelKey = "label", valueKey = "value" } = keyMap;

    return Array.isArray(data)
      ? data.map((item) => {
          const base = {
            label: item[labelKey] ?? item.name ?? item.Label ?? "Unnamed",
            value: item[valueKey] ?? item.id ?? item.Value ?? item,
          };

          // add extra fields
          extraFields.forEach((field) => {
            base[field] = item[field];
          });

          return base;
        })
      : [];
  } catch (err) {
    console.error("Error loading select options:", err);
    return [];
  }
};

// loadOptionsHelper.js
export const loadOPSelectOptions = async (
  apiPath,
  payload = {},
  inputValue = "",
  keyMap = {},
  method = "get",
) => {
  try {
    const data = await apiRequest({
      apiPath,
      payload: { ...payload, searchTerm: inputValue },
      method,
    });

    const { labelKey = "label", valueKey = "value" } = keyMap;

    // safely map data
    return Array.isArray(data)
      ? data.map((item) => ({
          label: item[labelKey] ?? item.name ?? item.Label ?? "Unnamed",
          value: item[valueKey] ?? item.id ?? item.Value ?? item,
        }))
      : [];
  } catch (err) {
    console.error("Error loading select options:", err);
    return [];
  }
};

export const loadOPSelectOptionsPost = async (
  apiPath,
  payload = {},
  inputValue = "",
  keyMap = {},
  method = "post",
) => {
  try {
    const data = await apiRequest({
      apiPath: apiPath,
      payload: { ...payload, searchTerm: inputValue },
      method,
    });

    const { labelKey = "label", valueKey = "value" } = keyMap;

    // safely map data
    return Array.isArray(data)
      ? data.map((item) => ({
          label: item[labelKey] ?? item.name ?? item.Label ?? "Unnamed",
          value: item[valueKey] ?? item.id ?? item.Value ?? item,
        }))
      : [];
  } catch (err) {
    console.error("Error loading select options:", err);
    return [];
  }
};

export const dummyCustomers = [
  {
    id: 1,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 2,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 3,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 4,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 5,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 6,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 7,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 8,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 9,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 10,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 11,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 12,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 13,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 14,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 15,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 16,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 17,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 18,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 19,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 20,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 21,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 22,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 23,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 24,
    name: "John Doe",
    country: { name: "USA", code: "us" },
    representative: { name: "Amy Elsner", image: "amyelsner.png" },
    status: "qualified",
    verified: true,
    date: "2025-07-01",
    activity: 50,
  },
  {
    id: 25,
    name: "Jane Smith",
    country: { name: "UK", code: "gb" },
    representative: { name: "Anna Fali", image: "annafali.png" },
    status: "unqualified",
    verified: false,
    date: "2025-06-15",
    activity: 30,
  },
];

export const titleMap = {
  edit: "Edit",
  clone: "Clone",
  create: "Create",
  DMTemplates: "Select",
};

export const handleDownload = async (doc) => {
  console.log("Downloading document", { doc });
  // logger.info("Downloading document", { doc });
  try {
    const payload = {
      Extension: doc.extension,
      UNC: doc.unc,
      NodeForGrid: doc.folder || "", // adjust if needed
      FileName: doc.fileName,
    };

    const response = await apiRequest({
      apiPath: "/file",
      method: "POST",
      payload,
      responseType: "blob",
      apiClient: "dm",
      isFormData: true,
    });

    // 🔥 Create download link
    const blob = new Blob([response], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", doc.fileName);
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Download failed", err);
  }
};

export const handlePreview = async (doc) => {
  console.log("Downloading document", { doc });
  // logger.info("Downloading document", { doc });
  try {
    const url = await apiRequest({
      apiPath: `Blob/preview?containerName=case-documents&blobName=${doc.unc}`,

      apiClient: "dm",
    });
    const previewUrl = url?.previewUrl;
    // if (previewUrl) {
    //   window.open(previewUrl, "_blank", "noopener,noreferrer");
    // }

    return url;
  } catch (err) {
    console.error("Download failed", err);
  }
};

// const [viewMode, setViewMode] = useState("list");
// const [selectedFiles, setSelectedFiles] = useState([]);

// --- Utility: Get all files in a folder recursively
// const getFolderFiles = useCallback((folder) => {
//   if (!folder) return [];
//   const recurse = (f) =>
//     [...(f.files || []), ...(f.folders || []).flatMap(recurse)];
//   return recurse(folder);
// }, []);

// --- Utility: Get all files in a case recursively
// const getCaseFiles = useCallback((caseObj) => {
//   if (!caseObj) return [];
//   const recurse = (folders) =>
//     folders.flatMap((f) => [
//       ...(f.files || []),
//       ...(f.folders?.length ? recurse(f.folders) : []),
//     ]);
//   return [...(caseObj.rootFiles || []), ...recurse(caseObj.folders || [])];
// }, []);

// --- Derived values
// const { mainTitle, filesToRender, isAllCasesView } = useMemo(() => {
//   if (selectedCase?.allCases) {
//     return { mainTitle: "All Cases", filesToRender: allCases, isAllCasesView: true };
//   }

//   if (selectedFolder) {
//     return {
//       mainTitle: selectedFolder.name,
//       filesToRender: getFolderFiles(selectedFolder),
//       isAllCasesView: false,
//     };
//   }

//   if (selectedCase) {
//     const caseObj = allCaseFolders[selectedCase.caseId];
//     return {
//       mainTitle: selectedCase.name,
//       filesToRender: getCaseFiles(caseObj),
//       isAllCasesView: false,
//     };
//   }

//   return { mainTitle: "Select a case or folder", filesToRender: [], isAllCasesView: false };
// }, [selectedCase, selectedFolder, allCases, allCaseFolders, getFolderFiles, getCaseFiles]);

// --- Select all toggle logic
// const handleSelectAllToggle = useCallback(() => {
//   if (!selectedCase && !selectedFolder) return;

//   const allFiles = selectedCase
//     ? getCaseFiles(allCaseFolders[selectedCase.caseId])
//     : getFolderFiles(selectedFolder);

//   const allSelected = selectedFiles.length === allFiles.length;
//   setSelectedFiles(allSelected ? [] : allFiles);
// }, [selectedCase, selectedFolder, selectedFiles, allCaseFolders, getFolderFiles, getCaseFiles]);

// const isAllSelected = useMemo(() => {
//   if (!selectedCase && !selectedFolder) return false;

//   const allFiles = selectedCase
//     ? getCaseFiles(allCaseFolders[selectedCase.caseId])
//     : getFolderFiles(selectedFolder);

//   return selectedFiles.length === allFiles.length && allFiles.length > 0;
// }, [selectedFiles, selectedCase, selectedFolder, allCaseFolders, getFolderFiles, getCaseFiles]);

export const capitalize = (value = "") => {
  const newValue = value.split("_").join(" ");
  return newValue.charAt(0).toUpperCase() + newValue.slice(1);
};

export const formatFieldValue = (field) => {
  const { value, formatterId } = field;

  if (value === null || value === undefined || value === "") return value;

  switch (formatterId) {
    case 4: {
      // Phone Number
      const digits = String(value)
        .split(".")[0] // Remove decimal part
        .replace(/\D/g, "")
        .slice(0, 10);

      return digits.length === 10
        ? digits.replace(/(\d{3})(\d{3})(\d{4})/, "($1) $2-$3")
        : value;
    }

    case 5: // Currency
      return Number(value).toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

    case 8: {
      // SSN
      const digits = String(value)
        .split(".")[0] // Remove decimal part
        .replace(/\D/g, "")
        .slice(0, 9);

      return digits.length === 9
        ? digits.replace(/(\d{3})(\d{2})(\d{4})/, "$1-$2-$3")
        : value;
    }

    default:
      return value;
  }
};

export const formatColumnHeader = (value) => {
  if (!value) return "";

  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};
