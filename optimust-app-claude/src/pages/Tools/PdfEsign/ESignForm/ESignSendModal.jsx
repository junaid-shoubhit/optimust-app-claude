import React from "react";
import ESignSendForm from "./ESignSendForm";

const ESignSendModal = ({ visible, setVisible, files, coordinates }) => {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[40vw] p-6 shadow-lg">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Send for eSign</h2>
          <button onClick={() => setVisible(false)}>✕</button>
        </div>

        {/* Form */}
        <ESignSendForm
          setVisible={setVisible}
          files={files}
          coordinates={coordinates}
        />
      </div>
    </div>
  );
};

export default ESignSendModal;