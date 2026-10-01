/* =========================================================
    FLOATING BUTTON
========================================================= */

const ChatFloatingButton = ({ onClick }) => {
  return (
    <div className="fixed bottom-1 right-3 z-[999]">
      <button
        type="button"
        onClick={onClick}
        className="
          group
          flex items-center gap-2
          rounded-2xl
          px-2 py-1
          shadow-[0_10px_35px_rgba(37,99,235,0.35)]
          border border-white/20
          backdrop-blur-xl
          transition-all duration-300
          hover:scale-[1.03]
          active:scale-[0.98]
        "
        style={{
          background: "linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)",
        }}
      >
        <div className="relative flex items-center justify-center">
          <i className="pi pi-comments text-white text-2xl!" />
        </div>
      </button>
    </div>
  );
};

export default ChatFloatingButton;
