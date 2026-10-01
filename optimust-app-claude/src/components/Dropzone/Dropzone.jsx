// Dropzone.jsx
import React, { useRef, useCallback, useState } from "react";
import { MdCloudUpload, MdClose } from "react-icons/md";

const allowedFileTypes = ["application/pdf"];

const Dropzone = ({ onDrop, files = [], onDeleteFile }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragOver(false);
      const validFiles = Array.from(e.dataTransfer.files).filter((f) =>
        allowedFileTypes.includes(f.type),
      );
      onDrop(validFiles);
    },
    [onDrop],
  );

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
         className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all
          ${isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:border-gray-400 bg-gray-50"}`}
      >
      <MdCloudUpload className="mx-auto h-10 w-10 text-gray-400" />
     <p className="mt-3 text-base font-medium text-gray-900">
          Drag & drop files here, or click to select files
        </p>
     <p className="text-xs text-gray-500 mt-1">
          Only PDF files are supported
        </p>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files);
            onDrop(files);

            // 🔥 THIS FIX
            e.target.value = null;
          }}
        />
      </div>

      {files.length > 0 && (
     <div className="mt-4 grid grid-cols-2 gap-2">  
          {files.map((file, idx) => (
            <div
              key={idx}
className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">📄</span>
                <div>
                  <p className="text-sm font-medium">{file.name}</p>
                 <p className="text-[10px] text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <MdClose
              className="cursor-pointer text-sm text-gray-400 hover:text-red-500"
                onClick={() => onDeleteFile(idx)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropzone;
