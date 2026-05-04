import { format } from "date-fns";

function Avatar({ src, name }) {
  if (src) {
    return <img src={src} alt={name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" />;
  }
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="w-7 h-7 rounded-full bg-blue-400 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
      {initials}
    </div>
  );
}

export default function MessageItem({ message, isMine, showAvatar, showSenderName }) {
  const { senderName, senderAvatar, content, createdAt, deleted, seenBy, messageType } = message;

  const timeStr = createdAt ? format(new Date(createdAt), "HH:mm") : "";

  if (messageType === "SYSTEM") {
    return (
      <div className="flex justify-center my-1">
        <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-3 py-0.5">{content}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-end gap-1.5 group ${isMine ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar — only for others */}
      {!isMine ? (
        showAvatar ? (
          <Avatar src={senderAvatar} name={senderName} />
        ) : (
          <div className="w-7 flex-shrink-0" />
        )
      ) : null}

      <div className={`flex flex-col max-w-[65%] ${isMine ? "items-end" : "items-start"}`}>
        {showSenderName && !isMine && (
          <span className="text-xs text-gray-500 mb-0.5 ml-1">{senderName}</span>
        )}

        {/* Bubble */}
        <div
          className={`relative px-3 py-2 rounded-2xl text-sm leading-relaxed break-words
            ${isMine
              ? "bg-blue-500 text-white rounded-br-md"
              : "bg-white text-gray-900 rounded-bl-md shadow-sm border border-gray-100"
            }
            ${deleted ? "opacity-60 italic" : ""}
          `}
        >
          {deleted ? (
            <span className="text-xs">Tin nhắn đã bị xóa</span>
          ) : (
            content
          )}
        </div>

        {/* Time + seen */}
        <div className={`flex items-center gap-1 mt-0.5 ${isMine ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-gray-400">{timeStr}</span>
          {isMine && seenBy && seenBy.length > 0 && (
            <span className="text-[10px] text-blue-400">Đã xem</span>
          )}
        </div>
      </div>
    </div>
  );
}
