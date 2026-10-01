import { useState } from "react";
import { apiRequest } from "../../../../services/apiBinding";
import { Dialog } from "primereact/dialog";
import { ProgressSpinner } from "primereact/progressspinner";
import { PiEye } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { confirmDialog } from "primereact/confirmdialog";

const DMPreview = ({ selectedFile, fileActionRef }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handlePreview = async (file) => {
    try {
      setLoading(true);

      const ext = file.extension?.toLowerCase();

      // URL / Link
      if (ext === "url" || ext === "link") {
        navigate(`${encodeURIComponent(file.unc)}`);
        fileActionRef.current?.hide();
        return;
      }

      // PDF / Images
      if (["pdf", "png", "jpg", "jpeg"].includes(ext)) {
        const response = await apiRequest({
          apiPath: `Blob/preview?containerName=case-documents&blobName=${file.unc}`,
          apiClient: "dm",
        });

        setPreviewUrl(response?.data);
        setShowPreview(true);
        return;
      }

      // DOCX
      if (ext === "docx") {
        const getEditLink = async () => {
          return await apiRequest({
            apiPath: `DocumentEdit/${file?.imageId}/edit-link?fileName=${encodeURIComponent(
              file?.fileName,
            )}`,
            apiClient: "dm",
            method: "post",
            noErrorHandle: true,
          });
        };

        const response = await getEditLink();

        // Document is locked
        if (response?.statusCode === 408 && !response?.success) {
          confirmDialog({
            message:
              response?.message ||
              "This document is currently locked. Do you want to edit it anyway?",
            header: "Edit Document",
            icon: "pi pi-exclamation-triangle",

            acceptLabel: "Edit Anyway",
            rejectLabel: "Cancel",
            className: "dm-confirm-dialog",

            acceptClassName: "dm-confirm-accept",
            acceptIcon: "pi pi-pencil",
            rejectClassName: "dm-confirm-reject",
            rejectIcon: "pi pi-times",
            // style: {
            //   width: "320px",
            //   // padding: "4px",
            // },
            accept: async () => {
              try {
                setLoading(true);

                // 1. Override the existing lock
                const overrideResponse = await apiRequest({
                  apiPath: `DocumentEdit/${file?.imageId}/override-lock`,
                  apiClient: "dm",
                  method: "post",
                  noErrorHandle: true,
                });

                console.log("overrideResponse", overrideResponse);

                // 2. Check override success
                if (!overrideResponse?.message) {
                  toast.error(
                    overrideResponse?.message ||
                      "Unable to override the document lock.",
                  );
                  return;
                }

                // 3. Get a fresh edit link
                const editResponse = await getEditLink();

                console.log("editResponse", editResponse);

                const launchUri = editResponse?.launchUri;

                if (!launchUri) {
                  toast.error("Microsoft Word launch URI was not returned.");
                  return;
                }

                // 4. Close action menu
                fileActionRef.current?.hide();

                // 5. Open Microsoft Word
                window.location.href = launchUri;
              } catch (error) {
                console.error("Override lock error:", error);

                toast.error(
                  "Something went wrong while unlocking the document.",
                );
              } finally {
                setLoading(false);
              }
            },

            reject: () => {
              console.log("Editing cancelled");
            },
          });

          return;
        }

        // Normal edit flow
        const launchUri = response?.launchUri;

        if (!launchUri) {
          toast.error("Microsoft Word launch URI was not returned.");
          return;
        }

        console.log("Word launch URI:", launchUri);

        fileActionRef.current?.hide();

        // Open Microsoft Word
        window.location.href = launchUri;

        return;
      }

      alert("Preview not supported for this file type.");
    } catch (err) {
      console.error("Preview error:", err);
    } finally {
      setLoading(false);
    }
  };

  const closePreview = () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setShowPreview(false);
    fileActionRef.current?.hide();
  };

  return (
    <>
      <li>
        <button
          onClick={() => handlePreview(selectedFile)}
          className="w-full text-sm text-left px-3 py-1 rounded hover:bg-gray-100 flex items-center gap-2"
          disabled={loading}
        >
          <PiEye size={14} />

          {selectedFile?.extension?.toLowerCase() === "docx"
            ? "Open in Word"
            : "Preview"}

          {loading && (
            <ProgressSpinner
              style={{ width: "1rem", height: "1rem" }}
              strokeWidth="2"
            />
          )}
        </button>
      </li>

      {/* PDF / Image Preview */}
      <Dialog
        header={selectedFile?.fileName}
        visible={showPreview}
        style={{ width: "70vw", height: "80vh" }}
        onHide={closePreview}
        maximizable
      >
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <ProgressSpinner />
          </div>
        ) : previewUrl ? (
          selectedFile?.extension?.toLowerCase() === "pdf" ? (
            <iframe
              src={previewUrl}
              allow="fullscreen"
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
              title="PDF Preview"
            />
          ) : (
            <img
              src={previewUrl}
              alt="Preview"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          )
        ) : (
          <p>Not Found...</p>
        )}
      </Dialog>
    </>
  );
};

export default DMPreview;
