import React, { useState } from "react";
import { apiRequest } from "../../../../services/apiBinding";
import { PiDownload } from "react-icons/pi";
import { ProgressSpinner } from "primereact/progressspinner";

const DMDownload = ({ selectedFile, fileActionRef }) => {
  const [loading, setLoading] = useState(false);
  const downloadFile = async (file) => {
    try {
      const ext = file.extension?.toLowerCase();
      setLoading(true);
      if (["pdf", "png", "jpg", "jpeg", "mp4"].includes(ext)) {
        // Get URL from API
        const blob = await apiRequest({
          apiPath: `Blob/download-bytes?containerName=case-documents&fileName=${file.unc}`,
          // `File?UNC=${encodeURIComponent(file.UNC)}&FileName=${encodeURIComponent(file.FileName)}&AccessToken=${localStorage.getItem("token")}`,
          config: { responseType: "blob" },
          apiClient: "dm",
          noErrorHandle: true,
        });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = file.fileName || "download";
        link.click();
        URL.revokeObjectURL(link.href);
      } else if (ext === "docx") {
        // Get file as ArrayBuffer (binary)
        const arrayBuffer = await apiRequest({
          apiPath: `Blob/download-bytes?containerName=case-documents&fileName=${file.unc}`,

          //   apiPath: `File?Extension=${file.Extension}&UNC=${encodeURIComponent(file.UNC)}&NodeForGrid=${encodeURIComponent(file.NodeForGrid)}&FileName=${encodeURIComponent(file.FileName)}`,
          config: { responseType: "arraybuffer" },
          apiClient: "dm",
          noErrorHandle: true,
        });

        // Convert ArrayBuffer to Blob for .docx
        const blob = new Blob([arrayBuffer], {
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        });

        // Trigger download as DOCX
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = file.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
      } else {
        alert("Preview not supported for this file type.");
      }
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download file.");
    }
    setLoading(false);

    fileActionRef.current.hide();
  };
  return (
    <>
      <li>
        <button
          onClick={() => downloadFile(selectedFile)}
          className="w-full text-sm text-left px-3 py-1 rounded hover:bg-gray-100 flex items-center gap-2"
        >
          <PiDownload size={14} />
          Download
          {loading && (
            <ProgressSpinner
              style={{ width: "1rem", height: "1rem" }}
              strokeWidth="2"
            />
          )}
        </button>
      </li>
    </>
  );
};

export default DMDownload;
