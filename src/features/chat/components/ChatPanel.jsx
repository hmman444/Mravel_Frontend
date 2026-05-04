import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import {
  loadConversationDetail,
  setActiveConversation,
  resetConversationUnread,
} from "../slices/chatSlice";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import GroupInfoPanel from "./GroupInfoPanel";
import {
  ChevronLeftIcon,
  InformationCircleIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";

function Avatar({ src, name, size = "sm" }) {
  const sz = size === "md" ? "w-9 h-9" : "w-7 h-7";
  if (src) return <img src={src} alt={name} className={`${sz} rounded-full object-cover flex-shrink-0`} />;
  const initials = (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <div className={`${sz} rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0`}>
      {initials}
    </div>
  );
}

export default function ChatPanel({ conversationId }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [showInfo, setShowInfo] = useState(false);

  const conversations = useSelector((s) => s.chat.conversations);
  const detail = useSelector((s) => s.chat.conversationDetails[conversationId]);

  const conv = detail || conversations.find((c) => c.id === conversationId);

  useEffect(() => {
    if (conversationId) {
      dispatch(loadConversationDetail(conversationId));
      dispatch(resetConversationUnread(conversationId));
    }
  }, [conversationId, dispatch]);

  if (!conversationId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center bg-gray-50">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-1">{t("chat.select_conversation")}</h3>
        <p className="text-sm text-gray-400">{t("chat.select_conversation_hint")}</p>
      </div>
    );
  }

  const isGroup = conv?.type === "GROUP";

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main panel */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white flex-shrink-0">
          <button
            onClick={() => dispatch(setActiveConversation(null))}
            className="sm:hidden p-1 rounded hover:bg-gray-100 text-gray-500"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>

          <Avatar src={conv?.avatarUrl} name={conv?.name} size="md" />

          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{conv?.name}</p>
            {isGroup && (
              <p className="text-xs text-gray-400">{conv?.memberCount} thành viên</p>
            )}
          </div>

          <div className="flex items-center gap-1">
            {isGroup && (
              <button
                onClick={() => setShowInfo((v) => !v)}
                className={`p-2 rounded-lg transition-colors ${showInfo ? "bg-blue-50 text-blue-600" : "hover:bg-gray-100 text-gray-500"}`}
                title={t("chat.group_info")}
              >
                <InformationCircleIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <MessageList
          key={conversationId}
          conversationId={conversationId}
          isGroup={isGroup}
        />

        {/* Input */}
        <MessageInput conversationId={conversationId} />
      </div>

      {/* Group Info Panel */}
      {showInfo && isGroup && (
        <GroupInfoPanel
          conversationId={conversationId}
          onClose={() => setShowInfo(false)}
        />
      )}
    </div>
  );
}
