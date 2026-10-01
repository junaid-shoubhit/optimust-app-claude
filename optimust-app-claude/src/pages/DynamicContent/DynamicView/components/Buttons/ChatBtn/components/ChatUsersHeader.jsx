/* =========================================================
    USERS HEADER
========================================================= */

const ChatUsersHeader = ({ searchText, setSearchText, onClose }) => {
  return (
    <div className="p-3 border-b border-gray-100 bg-white flex-shrink-0">
      <div className="h-12 flex items-center justify-between">
        {/* LEFT */}
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="
              relative h-8 w-8 rounded-3xl
              bg-gradient-to-br from-[#2563eb] to-[#4f46e5]
              flex items-center justify-center
              shadow-lg shadow-blue-500/20
              flex-shrink-0
            "
          >
            <i className="pi pi-comments text-white text-lg" />
          </div>

          <div className="min-w-0">
            <p className="text-[15px] font-semibold text-gray-900 truncate leading-none">
              Messages
            </p>

            <p className="text-xs text-gray-500 mt-1 truncate leading-none">
              Customer conversations
            </p>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="h-8 w-8" />

          <button
            onClick={onClose}
            className="
              h-8 w-8
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

      {/* SEARCH */}
      <div className="relative">
        <i className="pi pi-search absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400" />

        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder="Search User..."
          className="
            w-full h-10
            pl-10 pr-3
            rounded-2xl
            bg-[#f6f8fc]
            text-sm
          "
        />
      </div>
    </div>
  );
};

export default ChatUsersHeader;
