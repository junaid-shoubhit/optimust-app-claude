/* =========================================================
    MESSAGE BUBBLE
========================================================= */

const ChatMessageBubble = ({ msg }) => {
  const isMine =
    msg?.from === "me" || msg?.from === "self";

  return (
    <div
      className={`flex ${
        isMine ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`
          max-w-[80%]
          px-3 py-2
          rounded-[22px]
          text-sm
          shadow-sm
          whitespace-pre-wrap
          break-words
          ${
            isMine
              ? "bg-gradient-to-r from-[#2563eb] to-[#3b82f6] text-white rounded-br-[6px]"
              : "bg-white text-gray-800 rounded-bl-[6px] border border-gray-100"
          }
        `}
      >
        <p>{msg?.text}</p>

        {!!msg?.createdAt && (
          <p
            className={`text-[10px] mt-1 text-right ${
              isMine
                ? "text-white/70"
                : "text-gray-400"
            }`}
          >
            {msg?.createdAt}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChatMessageBubble;