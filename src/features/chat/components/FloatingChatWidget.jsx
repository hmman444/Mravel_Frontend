import { useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useChatRealtime } from "../hooks/useChatRealtime";
import ConversationList from "./ConversationList";
import ChatPanel from "./ChatPanel";
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/solid";

export default function FloatingChatWidget() {
  const { t } = useTranslation();
  const { accessToken, role } = useSelector((s) => s.auth);
  const activeId = useSelector((s) => s.chat.activeConversationId);
  const conversations = useSelector((s) => s.chat.conversations);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  // Global realtime subscriptions — moved here from ChatPage so there is only one
  // subscription point regardless of whether the user is on /chat or elsewhere.
  useChatRealtime(activeId);

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  // Render nothing for non-USER or unauthenticated visitors
  if (!accessToken || role !== "USER") return null;
  // Hide on the full-page chat route (it handles its own UI)
  if (location.pathname.startsWith("/chat")) return null;

  const handleClose = () => setIsOpen(false);

  return (
    <>
      {/* Popup panel — appears above the launcher button */}
      {isOpen && (
        <div
          className={
            "fixed right-6 bottom-[5.5rem] z-[9000] " +
            "w-[calc(100vw-3rem)] sm:w-[360px] " +
            "h-[520px] max-h-[calc(100vh-6rem)] min-h-[300px] " +
            "rounded-2xl shadow-2xl border border-gray-200 bg-white " +
            "overflow-hidden flex flex-col"
          }
        >
          {activeId ? (
            <ChatPanel conversationId={activeId} compact onClose={handleClose} />
          ) : (
            <ConversationList activeId={activeId} onClose={handleClose} />
          )}
        </div>
      )}

      {/* Circular launcher button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className={
          "fixed right-6 bottom-6 z-[9000] " +
          "w-14 h-14 rounded-full " +
          "bg-blue-500 hover:bg-blue-600 " +
          "shadow-lg text-white " +
          "flex items-center justify-center " +
          "transition-transform duration-150 active:scale-95 " +
          "focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
        }
        aria-label={t("chat.open")}
      >
        <ChatBubbleOvalLeftEllipsisIcon className="w-7 h-7" />
        {totalUnread > 0 && (
          <span
            className={
              "absolute -top-1 -right-1 " +
              "min-w-[20px] h-5 px-1 " +
              "bg-red-500 text-[11px] font-bold " +
              "rounded-full flex items-center justify-center"
            }
          >
            {totalUnread > 99 ? "99+" : totalUnread}
          </span>
        )}
      </button>
    </>
  );
}
