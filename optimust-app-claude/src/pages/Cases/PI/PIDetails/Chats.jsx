import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../../../../services/apiBinding";

const Chats = ({ entityId, activeMenu }) => {
  const queryClient = useQueryClient();
  const [searchText, setSearchText] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageText, setMessageText] = useState("");

  const messagesEndRef = useRef(null);

  /* =========================================================
      USERS LIST API
  ========================================================= */

  const {
    data: usersResponse,
    isLoading: isUsersLoading,
    isFetching: isUsersFetching,
  } = useQuery({
    queryKey: ["chat-users", entityId, activeMenu?.entityCodeId],
    queryFn: async ({ signal }) => {
      const res = await apiRequest({
        apiPath: "/Case/GetSendToUserList",
        method: "post",
        payload: {
          entityId,
          entityCodeId: activeMenu?.entityCodeId,
        },
        signal,
      });

      return res?.data || [];
    },
    enabled: !!entityId && !!activeMenu?.entityCodeId,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  /* =========================================================
      TRANSFORM USERS
  ========================================================= */

  const users = useMemo(() => {
    return (usersResponse || []).map((item) => {
      const [fullName = "", phoneAndType = ""] = item?.name
        ?.split("|")
        ?.map((s) => s?.trim());

      const match = phoneAndType.match(/(\d+)\s*\((.*?)\)/);

      const mobile = match?.[1] || "";
      const type = match?.[2] || "";

      return {
        id: item?.id,
        name: fullName,
        mobile,
        type,
        avatar: fullName
          ?.split(" ")
          ?.slice(0, 2)
          ?.map((x) => x?.[0])
          ?.join("")
          ?.toUpperCase(),
      };
    });
  }, [usersResponse]);

  /* =========================================================
      AUTO SELECT FIRST USER
  ========================================================= */

  useEffect(() => {
    if (!selectedUser && users?.length > 0) {
      setSelectedUser(users[0]);
    }
  }, [users, selectedUser]);

  /* =========================================================
      SEARCH FILTER
  ========================================================= */

  const filteredUsers = useMemo(() => {
    if (!searchText.trim()) return users;

    return users.filter((user) => {
      const search = searchText.toLowerCase();

      return (
        user?.name?.toLowerCase()?.includes(search) ||
        user?.mobile?.includes(search)
      );
    });
  }, [users, searchText]);

  /* =========================================================
      MESSAGES API
  ========================================================= */

  const {
    data: messagesResponse,
    isLoading: isMessagesLoading,
    isFetching: isMessagesFetching,
  } = useQuery({
    queryKey: [
      "chat-messages",
      entityId,
      activeMenu?.entityCodeId,
      selectedUser?.id,
    ],
    queryFn: async ({ signal }) => {
      const res = await apiRequest({
        apiPath: "/Utility/sms/message",
        method: "post",
        payload: {
          entityId,
          entityCodeId: activeMenu?.entityCodeId,
          mobile: selectedUser?.mobile,
          contactId: selectedUser?.id,
        },
        signal,
      });

      return res?.data || [];
    },
    enabled: !!entityId && !!activeMenu?.entityCodeId && !!selectedUser?.id,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });

  /* =========================================================
      NORMALIZE MESSAGES
  ========================================================= */

  const messages = useMemo(() => {
    return (messagesResponse || []).map((msg, index) => ({
      id: msg?.id || index,
      text: msg?.text || msg?.message || "",
      from: msg?.from || msg?.sender || "other",
      createdAt: msg?.createdAt || msg?.date || "",
    }));
  }, [messagesResponse]);

  /* =========================================================
      AUTO SCROLL
  ========================================================= */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /* =========================================================
      SEND MESSAGE API
  ========================================================= */

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      return apiRequest({
        apiPath: "/Utility/sms/send",
        method: "post",
        payload: {
          entityId,
          entityCodeId: activeMenu?.entityCodeId,
          mobile: selectedUser?.mobile,
          contactId: selectedUser?.id,
          message: messageText,
        },
      });
    },

    onSuccess: () => {
      setMessageText("");

      queryClient.invalidateQueries({
        queryKey: [
          "chat-messages",
          entityId,
          activeMenu?.entityCodeId,
          selectedUser?.id,
        ],
      });
    },
  });

  /* =========================================================
      SEND HANDLER
  ========================================================= */

  const handleSendMessage = useCallback(() => {
    if (!messageText?.trim()) return;

    sendMessageMutation.mutate();
  }, [messageText, sendMessageMutation]);

  /* =========================================================
      ENTER KEY
  ========================================================= */

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  /* =========================================================
      RENDER
  ========================================================= */

  return (
    <div className="h-full flex overflow-hidden rounded-2xl border bg-white">
      {/* =====================================================
          LEFT SIDEBAR
      ===================================================== */}

      <div className="w-[320px] min-w-[280px] border-r flex flex-col bg-white">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800">Conversations</h2>

            {isUsersFetching && (
              <span className="text-[11px] text-blue-500">Refreshing...</span>
            )}
          </div>

          {/* Search */}
          <input
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by name or mobile..."
            className="w-full h-10 px-3 text-sm rounded-xl border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Users */}
        <div className="flex-1 overflow-y-auto p-2">
          {isUsersLoading ? (
            <div className="space-y-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : filteredUsers?.length > 0 ? (
            <div className="space-y-2">
              {filteredUsers.map((user) => {
                const isActive = selectedUser?.id === user?.id;

                return (
                  <button
                    key={user?.id}
                    onClick={() => setSelectedUser(user)}
                    className={`w-full text-left p-3 rounded-2xl transition-all border ${
                      isActive
                        ? "bg-blue-50 border-blue-200 shadow-sm"
                        : "border-transparent hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#5c7fb7] to-blue-500 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
                        {user?.avatar}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-sm truncate text-gray-900">
                            {user?.name}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className="text-xs text-gray-500">
                            {user?.mobile}
                          </span>

                          {!!user?.type && (
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                                user?.type === "Primary"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {user?.type}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-gray-400">
              No users found
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          CHAT AREA
      ===================================================== */}

      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Header */}
        {/* Header */}
        <div className="h-[72px] px-5 border-b flex items-center justify-between bg-white">
          {selectedUser ? (
            <>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#5c7fb7] to-blue-500 text-white text-sm font-bold flex items-center justify-center">
                  {selectedUser?.avatar}
                </div>

                <div>
                  <p className="font-semibold text-sm text-gray-900">
                    {selectedUser?.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {selectedUser?.mobile}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {/* Refresh Button */}
                <button
                  onClick={() =>
                    queryClient.invalidateQueries({
                      queryKey: [
                        "chat-messages",
                        entityId,
                        activeMenu?.entityCodeId,
                        selectedUser?.id,
                      ],
                    })
                  }
                  disabled={isMessagesFetching}
                  className="h-10 w-10 rounded-xl border bg-white hover:bg-gray-50 flex items-center justify-center transition disabled:opacity-50"
                  title="Refresh Chat"
                >
                  <i
                    className={`pi pi-refresh text-sm text-gray-600 ${
                      isMessagesFetching ? "animate-spin" : ""
                    }`}
                  />
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-gray-500">Select a conversation</p>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-gray-50 px-4 py-5">
          {!selectedUser ? (
            <div className="h-full flex items-center justify-center text-sm text-gray-400">
              Select a user to start chatting
            </div>
          ) : isMessagesLoading ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={`flex ${
                    i % 2 === 0 ? "justify-start" : "justify-end"
                  }`}
                >
                  <div className="h-12 w-[220px] rounded-2xl bg-gray-200 animate-pulse" />
                </div>
              ))}
            </div>
          ) : messages?.length > 0 ? (
            <div className="space-y-3">
              {messages.map((msg) => {
                const isMine = msg?.from === "me" || msg?.from === "self";

                return (
                  <div
                    key={msg?.id}
                    className={`flex ${
                      isMine ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm shadow-sm whitespace-pre-wrap break-words ${
                        isMine
                          ? "bg-(--color-bgTwo) text-(--color-fontFour) rounded-br-sm"
                          : "bg-white text-(--color-fontFour) rounded-bl-sm"
                      }`}
                    >
                      <p>{msg?.text}</p>

                      {!!msg?.createdAt && (
                        <p className="text-[10px] opacity-60 mt-1 text-right">
                          {msg?.createdAt}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-gray-400">
              No messages available
            </div>
          )}
        </div>

        {/* Input */}
        {selectedUser && (
          <div className="border-t bg-white p-3">
            <div className="flex items-end gap-2">
              <textarea
                rows={1}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                className="flex-1 resize-none px-4 py-2.5 text-sm rounded-xl border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <button
                onClick={handleSendMessage}
                disabled={
                  !messageText?.trim() || sendMessageMutation?.isPending
                }
                className="h-11 px-5 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {sendMessageMutation?.isPending ? "Sending..." : "Send"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chats;
