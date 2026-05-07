import { useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loadMessages, markConversationSeen } from "../slices/chatSlice";
import MessageItem from "./MessageItem";
import TypingIndicator from "./TypingIndicator";

export default function MessageList({ conversationId, isGroup }) {
  const dispatch = useDispatch();
  const myUserId = useSelector((s) => s.auth?.user?.id);
  const conversationDetail = useSelector((s) => s.chat.conversationDetails[conversationId]);
  const conversationListItem = useSelector((s) =>
    s.chat.conversations.find((c) => c.id === conversationId)
  );
  const messages = useSelector((s) => s.chat.messages[conversationId] || []);
  const loading = useSelector((s) => s.chat.messagesLoading[conversationId]);
  const hasMore = useSelector((s) => s.chat.messagesHasMore[conversationId]);
  const nextCursor = useSelector((s) => s.chat.messagesCursors[conversationId]);
  const typingMap = useSelector((s) => s.chat.typingUsers[conversationId] || {});

  const bottomRef = useRef(null);
  const listRef = useRef(null);
  const isInitialLoad = useRef(true);
  const markSeenTimerRef = useRef(null);

  // Initial load
  useEffect(() => {
    if (conversationId) {
      isInitialLoad.current = true;
      dispatch(loadMessages({ conversationId }));
    }
  }, [conversationId, dispatch]);

  // Auto-scroll to bottom on new messages (only if near bottom already)
  useEffect(() => {
    const el = listRef.current;
    if (!el || messages.length === 0) return;

    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (isInitialLoad.current || isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: isInitialLoad.current ? "instant" : "smooth" });
      isInitialLoad.current = false;
    }
  }, [messages]);

  // Debounced markSeen: fires 1s after messages stop changing to avoid per-message API calls.
  useEffect(() => {
    if (messages.length === 0 || !conversationId) return;
    if (markSeenTimerRef.current) clearTimeout(markSeenTimerRef.current);
    markSeenTimerRef.current = setTimeout(() => {
      const lastReal = [...messages].reverse().find((m) => m.messageType !== "SYSTEM" && !m.pending);
      if (lastReal) {
        dispatch(markConversationSeen({ conversationId, lastMessageId: lastReal.id }));
      }
    }, 1000);
    return () => clearTimeout(markSeenTimerRef.current);
  }, [messages, conversationId, dispatch]);

  // Load more on scroll to top
  const handleScroll = useCallback(() => {
    const el = listRef.current;
    if (!el || loading || !hasMore) return;
    if (el.scrollTop < 80) {
      const prevScrollHeight = el.scrollHeight;
      dispatch(loadMessages({ conversationId, before: nextCursor })).then(() => {
        // Maintain scroll position after prepend
        requestAnimationFrame(() => {
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight - prevScrollHeight;
          }
        });
      });
    }
  }, [loading, hasMore, conversationId, nextCursor, dispatch]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.addEventListener("scroll", handleScroll);
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const memberList = conversationDetail?.members || conversationListItem?.members || [];
  const typingNames = Object.entries(typingMap)
    .filter(([uid]) => parseInt(uid, 10) !== myUserId)
    .map(([uid]) => {
      const member = memberList.find((m) => String(m.userId) === String(uid));
      return member?.fullname || `User ${uid}`;
    });

  return (
    <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-1">
      {/* Load more indicator */}
      {hasMore && (
        <div className="flex justify-center py-2">
          {loading ? (
            <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="text-xs text-gray-400">Cuộn lên để xem thêm</span>
          )}
        </div>
      )}

      {messages.length === 0 && !loading && (
        <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
          Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện!
        </div>
      )}

      {messages.map((msg, idx) => {
        const isMine = msg.senderId === myUserId;
        const prevMsg = messages[idx - 1];
        const showAvatar = !isMine && (idx === 0 || prevMsg?.senderId !== msg.senderId);
        const showSenderName = isGroup && showAvatar;
        return (
          <MessageItem
            key={msg.id}
            message={msg}
            isMine={isMine}
            showAvatar={showAvatar}
            showSenderName={showSenderName}
          />
        );
      })}

      <TypingIndicator names={typingNames} />
      <div ref={bottomRef} />
    </div>
  );
}
