import React, {
  useMemo,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import { Dialog } from "primereact/dialog";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { apiRequest } from "../../../../../../services/apiBinding";
import ChatInput from "./components/ChatInput";
import ChatMessages from "./components/ChatMessages";
import ChatHeader from "./components/ChatHeader";
import ChatUsersList from "./components/ChatUsersList";
import ChatUsersHeader from "./components/ChatUsersHeader";
import ChatFloatingButton from "./components/ChatFloatingButton";

/* =========================================================
    MAIN COMPONENT
========================================================= */

const ChatWidget = ({ entityId, activeMenu }) => {
  const queryClient = useQueryClient();

  const [visible, setVisible] = useState(false);

  const [searchText, setSearchText] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  const [messageText, setMessageText] = useState("");

  const messagesEndRef = useRef(null);

  const dialogWidth = "345px";

  const dialogHeight = "480px";

  const resetChatWidget = () => {
    setVisible(false);

    setSelectedUser(null);

    setSearchText("");

    setMessageText("");

    queryClient.removeQueries({
      queryKey: ["chat-messages"],
    });
  };

  useEffect(() => {
    setMessageText("");
  }, [selectedUser?.id]);

  /* USERS API */

  const { data: usersResponse, isLoading: isUsersLoading } = useQuery({
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

    enabled: visible && !!entityId && !!activeMenu?.entityCodeId,

    staleTime: 1000 * 60 * 5,

    refetchOnWindowFocus: false,
  });

  /* USERS TRANSFORM */

  const users = useMemo(() => {
    return (usersResponse || []).map((item) => {
      const [fullName = "", phoneAndType = ""] = item?.name
        ?.split("|")
        ?.map((s) => s?.trim());

      const match = phoneAndType.match(/([^(]+)\s*\((.*?)\)/);

      const mobile = match?.[1]?.trim() || "";

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

  /* FILTER USERS */

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

  /* MESSAGES API */

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

    enabled:
      visible && !!entityId && !!activeMenu?.entityCodeId && !!selectedUser?.id,

    staleTime: 1000 * 60,

    refetchOnWindowFocus: false,
  });

  /* NORMALIZE MESSAGES */

  const messages = useMemo(() => {
    return (messagesResponse || []).map((msg, index) => ({
      id: msg?.id || index,

      text: msg?.text || msg?.message || "",

      from: msg?.from || msg?.sender || "other",

      createdAt: msg?.createdAt || msg?.date || "",
    }));
  }, [messagesResponse]);

  /* AUTO SCROLL */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  /* SEND MESSAGE */

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      return apiRequest({
        apiPath: "/Utility/sms/out",
        method: "post",
        payload: {
          entityId,
          entityCodeId: activeMenu?.entityCodeId,
          to: selectedUser?.mobile,
          clientId: selectedUser?.id,
          imageUNC: "",
          body: messageText,
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

  /* SEND HANDLER */

  const handleSendMessage = useCallback(() => {
    if (!messageText?.trim()) return;

    sendMessageMutation.mutate();
  }, [messageText, sendMessageMutation]);

  /* ENTER KEY */

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();

      handleSendMessage();
    }
  };

  return (
    <>
      {!visible && <ChatFloatingButton onClick={() => setVisible(true)} />}

      <Dialog
        visible={visible}
        onHide={() => setVisible(false)}
        draggable
        resizable={false}
        modal={false}
        closable={false}
        showHeader={false}
        dismissableMask={false}
        keepInViewport
        position="bottom-right"
        style={{
          width: dialogWidth,
          height: dialogHeight,
          maxWidth: "95vw",
          margin: "0.5rem",
          boxShadow: "none",
        }}
        contentClassName="
          p-0
          overflow-hidden
          rounded-[32px]
          border border-gray-200/80
        "
      >
        <div className="h-full flex flex-col bg-white overflow-hidden">
          {!selectedUser ? (
            <>
              <ChatUsersHeader
                searchText={searchText}
                setSearchText={setSearchText}
                onClose={resetChatWidget}
              />

              <ChatUsersList
                loading={isUsersLoading}
                users={filteredUsers}
                onSelect={setSelectedUser}
              />
            </>
          ) : (
            <>
              <ChatHeader
                selectedUser={selectedUser}
                onBack={() => {
                  setSelectedUser(null);
                  setMessageText("");
                }}
                onClose={resetChatWidget}
                onRefresh={() =>
                  queryClient.invalidateQueries({
                    queryKey: [
                      "chat-messages",
                      entityId,
                      activeMenu?.entityCodeId,
                      selectedUser?.id,
                    ],
                  })
                }
                isRefreshing={isMessagesFetching}
              />

              <ChatMessages
                loading={isMessagesLoading}
                messages={messages}
                messagesEndRef={messagesEndRef}
              />

              <ChatInput
                value={messageText}
                onChange={setMessageText}
                onSend={handleSendMessage}
                onKeyDown={handleKeyDown}
                loading={sendMessageMutation?.isPending}
              />
            </>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default ChatWidget;

{
  /* <button
        type="button"
        className=" flex items-center gap-2    rounded-2xl    px-3 py-2    shadow-xl    border border-white/20    backdrop-blur-xl    transition-all duration-300 hover:scale-105 "
        style={{
          background:
            "linear-gradient(135deg, var(--color-bgFive), var(--color-bgSeven))",
        }}
      >
        <i className="pi pi-comments text-white text-lg" />

        <span className="text-white font-medium">Chat</span>
      </button> */
}
