// src/pages/esign/DocumentSigning.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import { MdArrowBack, MdArrowForward, MdClose } from "react-icons/md";
import { toast } from "react-toastify";
import CustomButton from "../../components/Forms/Buttons/CustomButton";
import SignaturePad from "./SignaturePad";
import { useSearchParams } from "react-router-dom";
import { apiRequest } from "../../services/apiBinding";
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

SignaturePad.displayName = "SignaturePad";

// Main Component

const DocumentSigning = () => {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pdfWidth, setPdfWidth] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const pdfContainerRef = useRef(null);
  const signatureRef = useRef(null);
  const initialsRef = useRef(null);

  const [searchParams] = useSearchParams();
  const [documents, setDocuments] = useState([]);
  const [alreadySigned, setAlreadySigned] = useState(false);
  const [hasInitials, setHasInitials] = useState(false);
  const [loadingDocument, setLoadingDocument] = useState(true);
  // const guid = "5cd67321-2f9b-4763-adb0-e507842b9ffa";
  // const guid = searchParams.get("id");
  const currentDocument = documents[currentPage] || null;
  const currentPdfUrl = currentDocument?.previewUrl || "";

  const guid = window.location.search.replace(/^\?/, "");
  console.log("guid", guid);

  const dataUrlToPngFile = (dataUrl, fileName) => {
    const [meta, base64] = dataUrl.split(",");
    const mimeType = meta.match(/data:(.*?);base64/)?.[1] || "image/png";
    const binaryString = atob(base64 || "");
    const bytes = new Uint8Array(binaryString.length);

    for (let index = 0; index < binaryString.length; index += 1) {
      bytes[index] = binaryString.charCodeAt(index);
    }

    return new File([bytes], fileName, { type: mimeType });
  };

  useEffect(() => {
    const fetchDocument = async () => {
      if (!guid) return;

      try {
        setLoadingDocument(true);

        const response = await apiRequest({
          apiPath: `/DocumentSigning/?guid=${guid}`,
          method: "get",
          apiClient: "dm",
        });

        if (response?.success) {
          const nextDocuments = Array.isArray(response?.documents)
            ? response.documents
            : [];

          console.log("response?.documents", nextDocuments);
          setDocuments(nextDocuments);
          setCurrentPage(0);
          setHasInitials(response?.hasInitials || false);
        }

        if (!response?.success) {
          setAlreadySigned(true);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load document.");
      } finally {
        setLoadingDocument(false);
      }
    };

    fetchDocument();
  }, []);

  useEffect(() => {
    const el = pdfContainerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      window.requestAnimationFrame(() => {
        if (el.clientWidth > 0) setPdfWidth(el.clientWidth);
      });
    });
    ro.observe(el);
    if (el.clientWidth > 0) setPdfWidth(el.clientWidth);
    return () => ro.disconnect();
  }, []);

  const onDocumentLoadSuccess = ({ numPages: np }) => {
    setNumPages(np);
    setCurrentPage(1);
  };

  const handleSubmit = async () => {
    if (alreadySigned) {
      toast.info("This document is already signed.");
      return;
    }

    const signatureData = signatureRef.current?.getDataURL();
    const initialsData = initialsRef.current?.getDataURL();

    if (!signatureData || (hasInitials && !initialsData)) {
      toast.info("Please provide both your signature and initials.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();

      formData.append("Guid", guid);
      formData.append("file", dataUrlToPngFile(signatureData, `${guid}.png`));
      if (hasInitials) {
        formData.append(
          "file",
          dataUrlToPngFile(initialsData, `${guid}-INITIALS.png`),
        );
      }

      await apiRequest({
        apiPath: "/DocumentSigning",
        method: "put",
        payload: formData,
        apiClient: "dm",
      });

      toast.success("Document signed successfully.");
      signatureRef.current?.clear();
      initialsRef.current?.clear();
      setAlreadySigned(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="lg:h-screen bg-gray-50 flex flex-col lg:flex-row overflow-hidden">
      {/* ── LEFT: PDF Viewer ── */}
      <div className="flex-[62] flex flex-col border-b lg:border-b-0 lg:border-r border-gray-200 overflow-hidden">
        {/* PDF toolbar */}
        <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between shrink-0">
          <p className="font-bold text-xs uppercase text-(--color-fontFour) tracking-wide">
            Document Preview
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <MdArrowBack size={16} className="text-gray-600" />
            </button>
            <span className="text-xs text-gray-500 min-w-[60px] text-center">
              {documents.length ? currentPage + 1 : 0} /{" "}
              {documents.length || "–"}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(documents.length - 1, p + 1))
              }
              disabled={currentPage >= documents.length - 1}
              className="w-7 h-7 flex items-center justify-center rounded-xl hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <MdArrowForward size={16} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* PDF area */}
        {loadingDocument ? (
          <div className="bg-white flex items-center justify-center py-24 text-gray-400 text-sm gap-2">
            <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-500 rounded-full animate-spin" />
            Loading document...
          </div>
        ) : alreadySigned ? (
          <div className="bg-white flex flex-col items-center justify-center py-24 text-center text-emerald-600 text-sm gap-2">
            <span className="text-base font-semibold uppercase tracking-wide">
              Already Signed
            </span>
            <span className="text-gray-500">
              This document has already been signed.
            </span>
          </div>
        ) : currentPdfUrl ? (
          <iframe
            src={currentPdfUrl}
            allow="fullscreen"
            style={{ width: "100%", height: "100%" }}
            title="Preview"
          />
        ) : (
          // <div> {currentPdfUrl}</div>
          <div className="bg-white py-24 text-center text-sm">
            Document already signed!
          </div>
        )}
      </div>

      {/* ── RIGHT: Signature Panel ── */}
      {!alreadySigned && (
        <div className="flex-[38] flex flex-col bg-white lg:overflow-hidden">
          <div className="flex-1 px-6 py-6 flex flex-col gap-5 lg:overflow-y-auto">
            {/* Header */}
            <div>
              <p className="text-md font-bold uppercase text-(--color-fontFour) mb-2">
                Please Sign Below
              </p>
              <p className="text-xs text-gray-400">
                Review the document, then draw your signature and initials.
              </p>
            </div>

            <div className="border-t border-gray-100" />

            {/* Signature — slightly narrower via max-w */}
            <div className="max-w-[92%]">
              <SignaturePad ref={signatureRef} label="Signature" />
            </div>

            {/* Initials */}
            {hasInitials && (
              <div className="max-w-[92%]">
                <SignaturePad ref={initialsRef} label="Initials" />
              </div>
            )}

            {/* Disclaimer */}
            <p className="text-xs text-gray-400 leading-relaxed border-l-2 border-gray-200 pl-3 max-w-[92%]">
              By submitting, you agree your e-signature is legally binding under
              applicable law.
            </p>

            {/* Submit — inline after content, not sticky */}
            <div className="flex justify-start gap-2">
              <CustomButton
                label="Confirm and Submit"
                onClick={handleSubmit}
                className="saveBtn text-white"
                disabled={submitting || alreadySigned}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentSigning;
