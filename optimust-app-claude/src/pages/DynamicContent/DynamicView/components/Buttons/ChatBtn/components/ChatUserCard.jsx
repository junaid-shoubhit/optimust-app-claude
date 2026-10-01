/* =========================================================
    USER CARD
========================================================= */

const ChatUserCard = ({ user, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="
        w-full p-2 rounded-2xl
        hover:bg-[#f5f8ff]
        transition-all duration-200
        border border-transparent
        hover:border-blue-100
        text-left
      "
    >
      <div className="flex items-center gap-3">
        <div
          className="
            relative h-10 w-10 rounded-2xl
            bg-gradient-to-br from-[#4f46e5] to-[#2563eb]
            text-white
            flex items-center justify-center
            font-semibold text-sm
            shadow-md
            flex-shrink-0
          "
        >
          {user?.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="font-semibold text-sm truncate text-gray-900">
              {user?.name}
            </p>

            {!!user?.type && (
              <span
                className={`
                  text-[10px]
                  px-2 py-1
                  rounded-full
                  font-semibold
                  flex-shrink-0
                  ${
                    user?.type === "Primary"
                      ? "bg-green-100 text-green-700"
                      : "bg-orange-100 text-orange-700"
                  }
                `}
              >
                {user?.type}
              </span>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-1 truncate">
            {user?.mobile}
          </p>
        </div>
      </div>
    </button>
  );
};

export default ChatUserCard;