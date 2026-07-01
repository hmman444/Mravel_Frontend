import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useChatRealtime } from "../hooks/useChatRealtime";
import { setActiveConversation } from "../slices/chatSlice";
import { PLANNER_CONV_ID } from "../planner";
import ConversationList from "./ConversationList";
import ChatPanel from "./ChatPanel";
import { AIPlanPanelView } from "../../aiPlan/components/AIPlanPanel";
import { useAIPlanSession } from "../../aiPlan/hooks/useAIPlanSession";
import { ChatBubbleOvalLeftEllipsisIcon } from "@heroicons/react/24/solid";

export default function FloatingChatWidget() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { accessToken, role } = useSelector((s) => s.auth);
  const activeId = useSelector((s) => s.chat.activeConversationId);
  const conversations = useSelector((s) => s.chat.conversations);
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  // Enlarge the popup in-place (no navigation) — the MAI chat window gets wider/taller.
  const [expanded, setExpanded] = useState(false);
  // The composer text lives HERE (not in the panel, which unmounts when the popup
  // closes) so a half-typed message survives closing/reopening the chat.
  const [maiDraft, setMaiDraft] = useState("");
  const panelRef = useRef(null);
  const launcherRef = useRef(null);

  // MAI (Mravel AI) is a pinned virtual assistant: its sentinel conversation renders
  // the full planner panel right inside the widget. `chatActiveId` strips the sentinel
  // so ChatPanel/realtime never receive the non-numeric "planner" id.
  const isPlanner = activeId === PLANNER_CONV_ID;
  const chatActiveId = isPlanner ? null : activeId;

  // The MAI session lives HERE (not inside the popup) so an in-flight answer keeps
  // streaming and is saved even if the user closes the popup. A red dot then signals
  // the new reply. The session also rehydrates on mount → returning users see history.
  const maiSession = useAIPlanSession(null);
  const [maiUnread, setMaiUnread] = useState(false);
  const prevMaiLenRef = useRef(maiSession.messages.length);
  const viewingMai = isOpen && isPlanner;

  useEffect(() => {
    const len = maiSession.messages.length;
    const prev = prevMaiLenRef.current;
    prevMaiLenRef.current = len;
    // prev > 0 skips the initial rehydrate (0 → N) so resuming an old chat doesn't
    // light up a fake unread dot — only genuinely new replies do.
    if (prev > 0 && len > prev && !viewingMai && maiSession.messages[len - 1]?.role === "ASSISTANT") {
      setMaiUnread(true);
    }
  }, [maiSession.messages, viewingMai]);

  useEffect(() => {
    if (viewingMai) setMaiUnread(false);
  }, [viewingMai]);

  // Global realtime subscriptions — moved here from ChatPage so there is only one
  // subscription point regardless of whether the user is on /chat or elsewhere.
  useChatRealtime(chatActiveId);

  // Click ra ngoài vùng chat (và ngoài nút launcher) -> đóng popup, khỏi phải bấm đúng nút X.
  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        launcherRef.current &&
        !launcherRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [isOpen]);

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
          ref={panelRef}
          className={
            "fixed right-6 bottom-[5.5rem] z-[9000] " +
            (expanded
              ? "w-[calc(100vw-3rem)] sm:w-[80vw] sm:max-w-[1200px] h-[85vh] max-h-[calc(100vh-6rem)] "
              : "w-[calc(100vw-3rem)] sm:w-[400px] h-[560px] max-h-[calc(100vh-6rem)] ") +
            "min-h-[300px] " +
            "rounded-2xl shadow-2xl border border-gray-200 bg-white " +
            "overflow-hidden flex flex-col transition-all duration-200"
          }
        >
          {isPlanner ? (
            <AIPlanPanelView
              session={maiSession}
              autoFocus={false}
              expanded={expanded}
              onToggleExpand={() => setExpanded((v) => !v)}
              draftInput={maiDraft}
              onDraftInputChange={setMaiDraft}
              onClose={() => dispatch(setActiveConversation(null))}
            />
          ) : chatActiveId ? (
            <ChatPanel conversationId={chatActiveId} compact onClose={handleClose} />
          ) : (
            <ConversationList activeId={activeId} onClose={handleClose} showPlanner />
          )}
        </div>
      )}

      {/* Circular launcher button */}
      <button
        ref={launcherRef}
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
        {totalUnread > 0 ? (
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
        ) : (
          maiUnread && (
            <span
              className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-red-500 ring-2 ring-white"
              aria-label={t("chat.mai_new_reply_aria")}
            />
          )
        )}
      </button>
    </>
  );
}
