import React, { useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Pencil, Trash2 } from "lucide-react";

const Signature = ({ field, value, onChange, disabled }) => {
  const sigRef = useRef(null);
  const clearSignature = () => {
    sigRef.current?.clear();
    onChange?.("");
  };

  return (
    <div className="w-full">
      {/* Label */}
      <label className="flex items-center gap-1 mb-[2px] uppercase text-xs font-medium text-gray-700">
        <Pencil size={12} />
        {field?.label || "Signature"}
      </label>

      {/* Signature Pad */}
      <div className="border border-gray-300 rounded-xl bg-white overflow-hidden shadow-sm">
        <SignatureCanvas
          ref={sigRef}
          penColor="black"
          canvasProps={{
            className: "w-full h-[180px]",
          }}
          onEnd={() => {
            try {
              if (!sigRef.current) return;

              const signatureData = sigRef.current.toDataURL("image/png");

              console.log("Signature Data:", signatureData);

              onChange?.(signatureData);
            } catch (error) {
              console.error("Signature Error:", error);
            }
          }}
          disabled={disabled}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-500">
          Sign using mouse, trackpad, or touch.
        </span>

        <button
          type="button"
          onClick={clearSignature}
          className="flex items-center gap-1 px-3 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          <Trash2 size={14} />
          Clear
        </button>
      </div>

      {/* Preview */}
      {value && (
        <div className="mt-[2px] border rounded-xl p-3 bg-gray-50">
          <p className="text-xs font-medium text-gray-500 mb-2">
            Signature Preview
          </p>

          <img
            src={value}
            alt="Signature"
            className="max-h-24 object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default Signature;
