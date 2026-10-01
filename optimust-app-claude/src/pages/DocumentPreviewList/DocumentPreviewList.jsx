import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { handlePreview } from "../../utils/constant";
const DocumentPreviewList = ({ documents }) => {
  const [previewUrl, setPreviewUrl] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const onPreviewClick = async (doc) => {
    try {
      setLoading(true);

      const response = await handlePreview(doc);
      console.log(response);
      if (response?.data) {
        setPreviewUrl(response.data);
        setShowPreview(true);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!documents?.length) return "-";

  return (
    <>
      <div className="flex flex-col gap-1">
        {documents.map((doc, index) => (
          <span
            key={index}
            className="text-blue-600 cursor-pointer hover:underline"
            onClick={() => onPreviewClick(doc)}
          >
            {doc.fileName || `Document ${index + 1}`}
          </span>
        ))}
      </div>

      <Dialog
        header="Document Preview"
        visible={showPreview}
        onHide={() => {
          setShowPreview(false);
          setPreviewUrl("");
        }}
        style={{ width: "66vw" }}
        maximizable
      >
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : (
          previewUrl && (
            <iframe
              src={previewUrl}
              title="PDF Preview"
              width="100%"
              height="800px"
              style={{ border: "none" }}
            />
          )
        )}
      </Dialog>
    </>
  );
};

export default DocumentPreviewList;
