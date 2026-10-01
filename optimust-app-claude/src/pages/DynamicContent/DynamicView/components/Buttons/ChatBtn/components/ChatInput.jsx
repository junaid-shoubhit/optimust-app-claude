/* =========================================================
    INPUT
========================================================= */

const ChatInput = ({
  value,
  onChange,
  onSend,
  onKeyDown,
  loading,
}) => {
  return (
    <div className="bg-white flex-shrink-0 p-3">
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            rows={1}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Type your message..."
            className="
              w-full resize-none
              px-4 py-3
              pr-12
              text-sm
              rounded-3xl
              bg-[#f6f8fc]
            "
          />
        </div>

        <button
          onClick={onSend}
          disabled={!value?.trim() || loading}
          className="
            h-12 w-12 rounded-2xl
            bg-gradient-to-r from-[#2563eb] to-[#3b82f6]
            text-white
            flex items-center justify-center
            hover:scale-[1.03]
            active:scale-[0.98]
            transition-all duration-200
            disabled:opacity-50
            disabled:hover:scale-100
            shadow-lg shadow-blue-500/25
            flex-shrink-0
          "
        >
          {loading ? (
            <i className="pi pi-spin pi-spinner text-sm" />
          ) : (
            <i className="pi pi-send text-sm" />
          )}
        </button>
      </div>
    </div>
  );
};

export default ChatInput;