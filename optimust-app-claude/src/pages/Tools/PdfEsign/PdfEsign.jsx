// src/pages/esign/PdfEsign.jsx
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import {
  MdEmail,
  MdArrowBack,
  MdArrowForward,
  MdPerson,
  MdAccessTime,
  MdTextFields,
} from "react-icons/md";
import { v4 as uuidv4 } from "uuid";
import { apiRequest } from "../../../services/apiBinding";
import { useCustomNavigation } from "../../../layouts/main/Navbar/NavigationContext";
import Dropzone from "./../../../components/Dropzone/Dropzone";
import ESignTagSelector from "./ESignTagSelector";
import ESignTag from "./ESignTag";
import workerSrc from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import StepModal from "../../../components/Modal/StepModal/StepModal";
import SendEmailSMSForm from "../../Forms/MailSMSForm/SendEmailSMSForm";
import { toast } from "react-toastify";
import customButton from "../../../components/forms/Buttons/CustomButton";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PdfEsign = ({ isFromPdfEsign = true, caseData, entityId }) => {
  const [files, setFiles] = useState([]);
  const [tags, setTags] = useState([]);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [selectedTagType, setSelectedTagType] = useState("signature");
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const pageContainerRef = useRef(null);

  const { activeMenu } = useCustomNavigation();
  const tagTypes = useMemo(
    () => [
      { value: "signature", name: "Signature", icon: <MdPerson size={28} /> },
      { value: "date", name: "Date Signed", icon: <MdAccessTime size={28} /> },
      { value: "initials", name: "Initials", icon: <MdTextFields size={28} /> },
    ],
    [],
  );

  // Resize Observer
  useEffect(() => {
    const container = pageContainerRef.current;
    if (!container) return;

    const updateSize = () => {
      // Only update if dimensions are greater than 0
      if (container.clientWidth > 0) {
        setContainerSize({
          width: container.clientWidth,
          height: container.clientHeight,
        });
      }
    };

    const ro = new ResizeObserver(() => {
      // Use requestAnimationFrame to ensure we don't trigger "ResizeObserver loop limit exceeded"
      window.requestAnimationFrame(updateSize);
    });

    ro.observe(container);

    // Initial check
    updateSize();

    return () => ro.disconnect();
  }, []); // Empty array is fine here because the RO handles the changes

  const resetPdfEsign = () => {
    setFiles([]);
    setTags([]);
    setCurrentFileIndex(0);
    setCurrentPage(1);
    setNumPages(0);
    setSelectedTagType("signature");
    setContainerSize({ width: 0, height: 0 });
  };

  const onDrop = useCallback(
    (newFiles) => {
      const allowedTypes = [
        "application/pdf",
        // "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      const validFiles = newFiles.filter((file) =>
        allowedTypes.includes(file.type),
      );

      if (validFiles.length !== newFiles.length) {
        toast.info("Only PDF files are allowed");
      }

      const existingNames = new Set(files.map((f) => f.name));
      const uniqueFiles = validFiles.filter((f) => !existingNames.has(f.name));

      if (uniqueFiles.length > 0) {
        setFiles((prev) => [...prev, ...uniqueFiles]);
        setCurrentFileIndex((prev) => prev + uniqueFiles.length - 1);
      }
    },
    [files],
  );

  const handleDeleteFile = useCallback((index) => {
    setFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);

      setTags((prevTags) =>
        prevTags
          .filter((t) => t.currentFileIndex !== index)
          .map((t) =>
            t.currentFileIndex > index
              ? { ...t, currentFileIndex: t.currentFileIndex - 1 }
              : t,
          ),
      );

      setCurrentFileIndex((prevIndex) =>
        index < prevIndex ? prevIndex - 1 : Math.max(0, updated.length - 1),
      );

      return updated;
    });
  }, []);

  const onDocumentLoadSuccess = ({ numPages: np }) => {
    setNumPages(np);
    setCurrentPage(1);
  };

  const handlePdfClick = (e) => {
    if (!selectedTagType || !pageContainerRef.current) return;

    const rect = pageContainerRef.current.getBoundingClientRect();

    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const defaultWidth = rect.width * 0.2;
    const defaultHeight = rect.height * 0.1;

    const x = (clickX - defaultWidth / 2) / rect.width;
    const y = (clickY - defaultHeight / 2) / rect.height;

    const clampedX = Math.max(0, Math.min(1, x));
    const clampedY = Math.max(0, Math.min(1, y));

    const newTag = {
      id: uuidv4(),
      currentFileIndex,
      pageNumber: currentPage,
      x: clampedX * 100,
      y: clampedY * 100,
      width: 12,
      height: 5,
      tagType: tagTypes.find((t) => t.value === selectedTagType),
    };
    setTags((prev) => [...prev, newTag]);
  };
  const handleRemoveTag = (id) =>
    setTags((prev) => prev.filter((t) => t.id !== id));

  const updateTag = (updatedTag) => {
    setTags((prev) =>
      prev.map((t) => (t.id === updatedTag.id ? updatedTag : t)),
    );
  };

  const currentTags = useMemo(
    () =>
      tags.filter(
        (t) =>
          t.currentFileIndex === currentFileIndex &&
          t.pageNumber === currentPage,
      ),
    [tags, currentFileIndex, currentPage],
  );

  const handleSend = () => {
    if (files.length === 0) {
      toast.info("Please upload at least one file");
      return;
    }
    if (tags.length === 0) {
      toast.info("At least one tag is required");
      return;
    }
    setSendModalVisible(true);
  };

  const handlePageRenderSuccess = () => {
    if (pageContainerRef.current) {
      setContainerSize({
        width: pageContainerRef.current.clientWidth,
        height: pageContainerRef.current.clientHeight,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 overflow-auto">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 gap-3">
          <p className="font-bold uppercase text-(--color-fontFour)">
            PDF eSign
          </p>

          {files.length > 0 && (
            <button
              type="button"
              onClick={handleSend}
              className="saveBtn text-white"
            >
              Send
            </button>
          )}
        </div>

        <Dropzone
          onDrop={onDrop}
          files={files}
          onDeleteFile={handleDeleteFile}
          accept={{ "application/pdf": [".pdf"] }}
        />

        {files.length > 0 && (
          <div className="mt-8">
            <ESignTagSelector
              selectedType={selectedTagType}
              onSelectType={setSelectedTagType}
              tagTypes={tagTypes}
            />
          </div>
        )}

        {files.length > 0 && (
          <div className="mt-10">
            {files.length > 1 && (
              <div className="flex justify-center items-center gap-6 mb-6">
                <button
                  onClick={() => setCurrentFileIndex((p) => Math.max(0, p - 1))}
                  disabled={currentFileIndex === 0}
                >
                  <MdArrowBack
                    size={36}
                    className="text-gray-500 hover:text-gray-700"
                  />
                </button>
                <div className="px-8 py-3 bg-white border border-gray-200 rounded-xl font-small text-gray-700">
                  File {currentFileIndex + 1} of {files.length}
                </div>
                <button
                  onClick={() =>
                    setCurrentFileIndex((p) =>
                      Math.min(files.length - 1, p + 1),
                    )
                  }
                  disabled={currentFileIndex === files.length - 1}
                >
                  <MdArrowForward
                    size={36}
                    className="text-gray-500 hover:text-gray-700"
                  />
                </button>
              </div>
            )}

            <div className="text-center text-sm text-gray-500 mb-4">
              Page {currentPage} of {numPages || "?"}
            </div>

            <div className="flex items-center justify-center gap-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-40"
              >
                <MdArrowBack size={42} />
              </button>

              <div
                ref={pageContainerRef}
                className="relative bg-white border border-gray-200 shadow-2xl rounded-3xl overflow-hidden cursor-default w-full max-w-[780px]"
                onClick={handlePdfClick}
              >
                {files[currentFileIndex] && (
                  <Document
                    file={files[currentFileIndex]} // ← Direct File object (Best Practice)
                    onLoadSuccess={onDocumentLoadSuccess}
                    className="cursor-pointer"
                    loading={
                      <div className="h-[600px] flex items-center justify-center text-gray-500 font-medium">
                        Loading PDF...
                      </div>
                    }
                    onLoadError={(error) => {
                      console.error("PDF Load Error:", error);
                    }}
                    error={
                      <div className="h-[600px] flex items-center justify-center text-red-500 font-medium">
                        Failed to load PDF. Please try uploading again.
                      </div>
                    }
                  >
                    <Page
                      pageNumber={currentPage}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      renderMode="canvas"
                      width={pageContainerRef.current?.clientWidth || 800}
                      onRenderSuccess={handlePageRenderSuccess} // <-- Add this line
                    />

                    {/* Tags Overlay */}
                    <div className="absolute inset-0">
                      {currentTags.map((coord) => (
                        <ESignTag
                          key={coord.id}
                          coord={coord}
                          onRemove={handleRemoveTag}
                          onUpdate={updateTag}
                          containerSize={containerSize}
                        />
                      ))}
                    </div>
                  </Document>
                )}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
                disabled={currentPage === numPages || numPages === 0}
                className="text-gray-400 hover:text-gray-600 disabled:opacity-40"
              >
                <MdArrowForward size={42} />
              </button>
            </div>
          </div>
        )}
      </div>

      {sendModalVisible && (
        <StepModal
          visible={sendModalVisible}
          setVisible={setSendModalVisible}
          title="Send Email / SMS"
          widthConfig={{ 1: { width: "70vw" } }}
          designType="no-tabs-static"
          StepOneComponent={SendEmailSMSForm}
          details={{
            esign: true,
            caseId: caseData,
            entityCodeId: activeMenu?.entityCodeId,
            saveToCase: activeMenu?.entityCode == "pdf-eSign",
          }}
          id={entityId}
          enableDocument={false}
          esignFiles={files}
          coordinates={tags}
          esignNodeId={activeMenu?.id}
          activeMenu={activeMenu}
          resetPdfEsign={resetPdfEsign}
        />
      )}
    </div>
  );
};

export default PdfEsign;
