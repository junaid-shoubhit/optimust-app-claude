/* =========================================================
    MESSAGES
========================================================= */

import ChatMessageBubble from "./ChatMessageBubble";

const ChatMessages = ({
  loading,
  messages,
  messagesEndRef,
}) => {
  return (
    <div className="flex-1 overflow-y-auto mb-3 p-3 bg-[#f5f7fb]">
      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`flex ${
                i % 2 === 0
                  ? "justify-start"
                  : "justify-end"
              }`}
            >
              <div className="h-11 w-[180px] rounded-[22px] bg-gray-200 animate-pulse" />
            </div>
          ))}
        </div>
      ) : messages?.length > 0 ? (
        <div className="space-y-2">
          {messages.map((msg) => (
            <ChatMessageBubble
              key={msg?.id}
              msg={msg}
            />
          ))}

          <div ref={messagesEndRef} />
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center px-6">
          <div className="h-16 w-16 rounded-3xl bg-blue-50 flex items-center justify-center mb-4">
            <i className="pi pi-send text-2xl text-blue-500" />
          </div>

          <p className="text-sm font-semibold text-gray-700">
            No messages yet
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Start the conversation now
          </p>
        </div>
      )}
    </div>
  );
};

export default ChatMessages;