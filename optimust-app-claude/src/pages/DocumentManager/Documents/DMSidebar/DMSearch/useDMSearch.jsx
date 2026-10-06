import { useState } from "react";
import { apiRequest } from "../../../../../services/apiBinding";
import { buildFolderTree1 } from "../../helper";
import { useAppNavigation } from "../../../../../navigation/NavigationContext";

export const useDMSearch = ({
  setAllCases,
  setAllCaseFolders,
  setFiles,
  setSelectedCase,
  setSelectedDetails,
  setSelectedFiles,
  entityCodeId,
  SearchParm,
}) => {
  const [fileLoading, setFileLoading] = useState(false);
  const [folderLoading, setFolderLoading] = useState(false);
  const { activeMenu } = useAppNavigation();

  // NEW: backend DataSize
  const [caseTotalCount, setCaseTotalCount] = useState(0);
  const [fileTotalCount, setFileTotalCount] = useState(0);

  // -----------------------------
  // Clean Payload
  // -----------------------------
  const cleanPayload = (payload) =>
    Object.fromEntries(
      Object.entries(payload).filter(([, val]) => {
        if (val == null) return false;
        if (typeof val === "string" && val.trim() === "") return false;
        if (Array.isArray(val) && val.length === 0) return false;
        if (typeof val === "object" && Object.keys(val).length === 0)
          return false;
        return true;
      }),
    );

  // -----------------------------
  // Global Search
  // -----------------------------
  const performGlobalSearch = async (cleanedPayload, mode) => {
    let casesResponse = null;

    setFolderLoading(true);

    // ---- FOLDERS -------------------------------------------------
    if (mode !== "clearSearch") {
      try {
        const allNodes = await apiRequest({
          apiPath: "/documentnode",
          apiClient: "dm",
          payload: {
            EntityCodeId: entityCodeId,
          },
        });

        const root = buildFolderTree1("PI", allNodes?.data);
        setAllCaseFolders(root);
      } catch (folderErr) {
        console.error("Folder API failed:", folderErr);
        setAllCaseFolders([]);
      }
    }

    // ---- CASES ---------------------------------------------------
    try {
      casesResponse = await apiRequest({
        apiPath: "Document/GetdocumentList",
        payload: {
          ...cleanedPayload,
          isCases: 1,
          EntityCodeId: activeMenu?.entityCodeId,
          Page: cleanedPayload.Page || 1,
          PageSize: cleanedPayload.PageSize || 15,
          SearchParm,
        },
        apiClient: "dm",
        method: "post",
      });

      setAllCases(casesResponse?.documents || []);
      setCaseTotalCount(casesResponse?.dataSize || 0);
    } catch (caseErr) {
      console.error("Case API failed:", caseErr);

      setAllCases([]);
      setCaseTotalCount(0);
    }

    return casesResponse;
  };

  // -----------------------------
  // Main searchDocuments handler
  // -----------------------------
  const searchDocuments = async (payload, mode = "search", caseId) => {
    const cleanedPayload = cleanPayload(payload || {});

    if (!Object.keys(cleanedPayload).length) {
      setFiles([]);
      setAllCases([]);
      setAllCaseFolders([]);
      setCaseTotalCount(0);
      setFileTotalCount(0);
      return;
    }

    setFileLoading(true);

    const isSearch = mode === "search" || mode === "clearSearch";
    const isDraft = mode === "drafts";

    // -------------------------------------------------------------
    // Global File Name search
    //
    // FileName without FileNos/folderId means global FileName search
    // -------------------------------------------------------------
    const isGlobalFileNameSearch =
      mode === "files" &&
      !!cleanedPayload.FileName &&
      !cleanedPayload.FileNos &&
      !cleanedPayload.folderId;

    try {
      let casesResponse = null;

      // =====================================================
      // 🔵 GLOBAL SEARCH
      //
      // Case No
      // Case Name
      // Global File Name
      // =====================================================
      if (isSearch || isGlobalFileNameSearch) {
        casesResponse = await performGlobalSearch(
          cleanedPayload,
          mode,
        );
      }

      // =====================================================
      // 🟣 DRAFTS MODE
      // =====================================================
      if (isDraft) {
        try {
          const drafts = await apiRequest({
            apiPath: "Document/DraftDocumentPage",
            payload: {
              caseId,
              Page: cleanedPayload.Page || 1,
              PageSize: cleanedPayload.PageSize || 15,
            },
            apiClient: "dm",
            method: "post",
          });

          setFiles(drafts?.Documents);
          setFileTotalCount(drafts?.dataSize || 0);
        } catch (draftErr) {
          console.error("Draft API failed:", draftErr);
          setFiles([]);
          setFileTotalCount(0);
        }

        return;
      }

      // =====================================================
      // 🟢 FILE LIST MODE
      //
      // Runs for:
      // - Case No / Case Name global search
      // - Global File Name search
      // - Case-specific File Name search
      // - Folder-specific File Name search
      // =====================================================
      try {
        setSelectedFiles([]);

        const fileResponse = await apiRequest({
          apiPath: "Document/GetdocumentList",
          payload: {
            ...cleanedPayload,
            isCases: cleanedPayload.isCases ?? 0,
            EntityCodeId: activeMenu?.entityCodeId,
            Page: cleanedPayload.Page || 1,
            PageSize: cleanedPayload.PageSize || 15,
            SearchParm,
          },
          apiClient: "dm",
          method: "post",
        });

        setFiles(fileResponse?.documents || []);
        setFileTotalCount(fileResponse?.dataSize || 0);
      } catch (fileErr) {
        console.error("File API failed:", fileErr);

        setFiles([]);
        setFileTotalCount(0);
      }

      // =====================================================
      // 🟠 SELECTED CASE LOGIC
      // =====================================================
      if (isSearch || isGlobalFileNameSearch) {
        const docs = casesResponse?.documents || [];
        const multiple = docs.length > 1;

        if (multiple) {
          setSelectedCase({ allCasesFiles: true });
        } else {
          setSelectedCase({
            caseDetails: docs[0] || null,
          });

          if (setSelectedDetails) {
            setSelectedDetails({
              caseDetails: docs[0] || null,
            });
          }
        }
      }
    } catch (err) {
      console.error("General search error:", err);
    } finally {
      setFileLoading(false);
      setFolderLoading(false);
    }
  };

  // -----------------------------
  // RETURN ALL
  // -----------------------------
  return {
    searchDocuments,
    fileLoading,
    folderLoading,
    caseTotalCount,
    fileTotalCount,
  };
};