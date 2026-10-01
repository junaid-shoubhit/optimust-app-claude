/* =========================================================
    USERS LIST
========================================================= */

import ChatUserCard from "./ChatUserCard";

const ChatUsersList = ({
  loading,
  users,
  onSelect,
}) => {
  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto bg-white pt-2">
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-3xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!users?.length) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6">
        <div className="h-16 w-16 rounded-3xl bg-blue-50 flex items-center justify-center mb-4">
          <i className="pi pi-comments text-2xl text-blue-500" />
        </div>

        <p className="text-sm font-semibold text-gray-700">
          No conversations found
        </p>

        <p className="text-xs text-gray-400 mt-1">
          Try searching another customer
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-white pt-2">
      {users.map((user) => (
        <ChatUserCard
          key={user?.id}
          user={user}
          onClick={() => onSelect(user)}
        />
      ))}
    </div>
  );
};

export default ChatUsersList;