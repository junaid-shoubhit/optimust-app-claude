/* =========================================================
    CHAT HEADER
========================================================= */

const ChatHeader = ({
  selectedUser,
  onBack,
  onClose,
  onRefresh,
  isRefreshing,
}) => {
  return (
    <div className="h-12 bg-white flex items-center justify-between flex-shrink-0 px-4">
      {/* LEFT */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onBack}
          className="
            rounded-2xl
            hover:bg-gray-100
            transition-all duration-200
            flex items-center justify-center
            flex-shrink-0
          "
        >
          <i className="pi pi-arrow-left text-sm text-gray-700" />
        </button>

        <div className="min-w-0">
          <p className="text-sm font-semibold truncate text-gray-900 leading-none">
            {selectedUser?.name}
          </p>

          <p className="text-[11px] text-gray-500 truncate mt-1 leading-none">
            {selectedUser?.mobile}
          </p>
        </div>
      </div>

      {/* RIGHT ACTIONS */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onRefresh}
          className="
            rounded-2xl
            hover:bg-gray-100
            transition-all duration-200
            flex items-center justify-center
          "
        >
          <i
            className={`pi pi-refresh text-xs! text-gray-600 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </button>

        <button
          onClick={onClose}
          className="
            rounded-2xl
            hover:bg-red-50
            hover:text-red-500
            transition-all duration-200
            flex items-center justify-center
          "
        >
          <i className="pi pi-times text-xs!" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;