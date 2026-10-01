import { useState } from "react";
import { Dialog } from "primereact/dialog";
import NotesContent from "./components/NotesContent";

// import NotesContent from "./NotesContent";

const NotesBtn = (props) => {
  console.log("props", props);

  const [visible, setVisible] = useState(false);

  const resetNotesWidget = () => {
    setVisible(false);
  };

  const notesHeader = (
    <div
      className="
        flex items-center justify-between
        w-full
        text-white
        select-none
      "
    >
      <div className="flex items-center gap-2">
        <i className="pi pi-paperclip text-white text-lg" />

        <span className="font-semibold text-base">Notes</span>
      </div>

      <button
        type="button"
        onClick={resetNotesWidget}
        className="
          flex items-center justify-center
          w-8 h-8
          rounded-full
          hover:bg-white/20
          transition-colors
          cursor-pointer
        "
      >
        <i className="pi pi-times text-white" />
      </button>
    </div>
  );

  return (
    <>
      {!visible && (
        <div className="fixed bottom-1 right-15 z-999">
          <button
            type="button"
            onClick={() => setVisible(true)}
            className="
              group
              flex items-center gap-2
              rounded-2xl
              px-2 py-1
              shadow-[0_10px_35px_rgba(13,148,136,0.30)]
              border border-white/20
              backdrop-blur-xl
              transition-all duration-300
              hover:scale-[1.03]
              active:scale-[0.98]
            "
            style={{
              background: "linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)",
            }}
          >
            <div className="relative flex items-center justify-center">
              <i className="pi pi-paperclip text-white text-2xl!" />
            </div>
          </button>
        </div>
      )}

      <Dialog
        visible={visible}
        onHide={resetNotesWidget}
        draggable={true}
        resizable={true}
        modal={false}
        closable={false}
        dismissableMask={false}
        keepInViewport={true}
        position="bottom-right"
        header={notesHeader}
        className="notes-dialog"
        style={{
          width: "345px",
          height: "480px",
          minWidth: "300px",
          minHeight: "300px",
          maxWidth: "90vw",
          maxHeight: "85vh",
          margin: "0.5rem",
          boxShadow:
            "0 25px 70px rgba(0, 0, 0, 0.18), 0 8px 25px rgba(13, 148, 136, 0.12)",
        }}
        headerClassName="
          px-5
          py-4
          border-0
          cursor-move
        "
        contentClassName="
          p-0
          border-0
        "
      >
        <div className="h-full flex flex-col bg-white overflow-hidden">
          <NotesContent
            entityId={props?.entityId}
            activeMenu={props?.activeMenu}
          />
        </div>
      </Dialog>
    </>
  );
};

export default NotesBtn;
