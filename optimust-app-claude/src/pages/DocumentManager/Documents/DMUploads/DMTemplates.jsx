import { useState, lazy, Suspense } from "react";
import { Dialog } from "primereact/dialog";
import CaseFolderSelector from "./CaseFolderSelector";
import TemplateSkeleton from "../../Templates/TemplateSkeleton";

const TemplateForm = lazy(() => import("../../Templates/TemplateForm"));

export default function DMTemplates({ fileMenuRef, caseId, firmId, currentCaseFolders }) {
  const [showDialog, setShowDialog] = useState(false);
  const [showSelector, setShowSelector] = useState(false);
  const [resolvedData, setResolvedData] = useState(null);

  const openTemplate = () => {
    if (!caseId) {
      setShowSelector(true);
    } else {
      setShowDialog(true);
    }
  };

  const onSelectorComplete = (data) => {
    setResolvedData(data);
    setShowDialog(true);
  };

  const handleClose = () => {
    setShowDialog(false);
    fileMenuRef.current?.hide();
  };

  return (
    <>
      <li>
        <button onClick={openTemplate} className="w-full px-3 py-1 text-left hover:bg-gray-100">
          📑 New Document from Template
        </button>
      </li>

      <CaseFolderSelector
        visible={showSelector}
        onHide={() => setShowSelector(false)}
        onComplete={onSelectorComplete}
        currentCaseFolders={currentCaseFolders}
        requireFolder={false} 
      />

      <Dialog maximized visible={showDialog} onHide={handleClose}>
        <Suspense fallback={<TemplateSkeleton/>}>
          <TemplateForm 
            mode="DMTemplates"
            caseId={resolvedData?.caseId || caseId}
            folderId={resolvedData?.folderId}
            firmId={firmId}
            handleClose={handleClose}
          />
        </Suspense>
      </Dialog>
    </>
  );
}
