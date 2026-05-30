import { useTranslation } from "react-i18next";
import { formatDistanceToNow } from "date-fns";
import { vi, enUS } from "date-fns/locale";

function Avatar({ src, name, size = "md" }) {
  const sizeClass = size === "sm" ? "w-8 h-8 text-xs" : "w-11 h-11 text-sm";
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  const initials = (name || "?")
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div
      className={`${sizeClass} rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

function GroupAvatarStack({ members }) {
  const shown = members.slice(0, 3);
  return (
    <div className="relative w-11 h-11 flex-shrink-0">
      {shown.map((m, i) => (
        <div
          key={m.userId}
          className="absolute rounded-full border-2 border-white overflow-hidden"
          style={{
            width: shown.length === 1 ? 44 : 28,
            height: shown.length === 1 ? 44 : 28,
            right: i === 0 ? 0 : undefined,
            left: i === 1 ? 0 : i === 2 ? 8 : undefined,
            bottom: i === 0 ? 0 : i === 1 ? 0 : undefined,
            top: i === 2 ? 0 : undefined,
            zIndex: 3 - i,
          }}
        >
          <Avatar src={m.avatar} name={m.fullname} size="sm" />
        </div>
      ))}
    </div>
  );
}

export default function ConversationItem({ conversation, active, onClick, isOnline }) {
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "vi" ? vi : enUS;

  const { name, avatarUrl, type, lastMessage, unreadCount, updatedAt, members } = conversation;

  const timeAgo = updatedAt
    ? formatDistanceToNow(new Date(updatedAt), { addSuffix: false, locale })
    : "";

  const lastText = lastMessage
    ? lastMessage.deleted
      ? t("chat.message_deleted")
      : lastMessage.messageType === "IMAGE"
      ? t("chat.message_image")
      : lastMessage.messageType === "VIDEO"
      ? t("chat.message_video")
      : lastMessage.content
    : "";

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
        active
          ? "bg-blue-50 hover:bg-blue-100"
          : "hover:bg-gray-100"
      }`}
    >
      {/* Avatar */}
      {type === "GROUP" && members?.length > 0 ? (
        <GroupAvatarStack members={members} />
      ) : (
        <div className="relative flex-shrink-0">
          <Avatar src={avatarUrl} name={name} />
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className={`text-sm truncate font-medium ${active ? "text-blue-700" : "text-gray-900"}`}>
            {name}
          </span>
          <span className="text-xs text-gray-400 ml-2 flex-shrink-0">{timeAgo}</span>
        </div>
        <div className="flex items-center justify-between mt-0.5">
          <p className={`text-xs truncate ${unreadCount > 0 ? "font-semibold text-gray-800" : "text-gray-500"}`}>
            {lastText || <span className="italic text-gray-400">{t("chat.no_messages")}</span>}
          </p>
          {unreadCount > 0 && (
            <span className="ml-2 flex-shrink-0 min-w-[18px] h-[18px] px-1 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
