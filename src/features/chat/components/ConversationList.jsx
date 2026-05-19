import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { useChatPresence } from "../hooks/useChatPresence";
import {
  loadConversations,
  loadFriends,
  setActiveConversation,
  upsertConversation,
} from "../slices/chatSlice";
import { createPrivateConversation } from "../services/chatService";
import ConversationItem from "./ConversationItem";
import NewChatModal from "./NewChatModal";
import { PencilSquareIcon, MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon, XMarkIcon } from "@heroicons/react/24/outline";

function FriendRow({ friend, onStartChat }) {
  return (
    <button
      onClick={() => onStartChat(friend)}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      {friend.avatar ? (
        <img src={friend.avatar} alt={friend.fullname} className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
      ) : (
        <div className="w-8 h-8 rounded-full bg-blue-400 text-white text-xs flex items-center justify-center font-semibold flex-shrink-0">
          {(friend.fullname || "?")[0].toUpperCase()}
        </div>
      )}
      <span className="flex-1 text-left text-sm text-gray-700 truncate">{friend.fullname}</span>
    </button>
  );
}

export default function ConversationList({ activeId, onClose }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { conversations, conversationsLoading, conversationsLoaded, friends, friendsLoaded } = useSelector((s) => s.chat);
  const myUserId = useSelector((s) => s.auth?.user?.id);

  // Collect other-member IDs from private conversations for presence polling
  const presenceUserIds = useMemo(() => {
    const ids = new Set();
    conversations.forEach((c) => {
      if (c.type === "PRIVATE" && c.members) {
        c.members.forEach((m) => { if (m.userId !== myUserId) ids.add(m.userId); });
      }
    });
    return [...ids].sort((a, b) => a - b);
  }, [conversations, myUserId]);
  const onlineIds = useChatPresence(presenceUserIds);

  const [search, setSearch] = useState("");
  const [showNewChat, setShowNewChat] = useState(false);
  const [showFriends, setShowFriends] = useState(true);
  const [startingChat, setStartingChat] = useState(null);

  useEffect(() => {
    if (!conversationsLoaded) dispatch(loadConversations());
  }, [dispatch, conversationsLoaded]);

  useEffect(() => {
    if (!friendsLoaded) dispatch(loadFriends());
  }, [dispatch, friendsLoaded]);

  const filtered = conversations.filter((c) => {
    if (!search.trim()) return true;
    return c.name?.toLowerCase().includes(search.toLowerCase());
  });

  const handleNewConversation = (conv) => {
    dispatch(upsertConversation(conv));
    dispatch(setActiveConversation(conv.id));
    setShowNewChat(false);
  };

  const handleStartFriendChat = useCallback(async (friend) => {
    if (startingChat === friend.id) return;
    setStartingChat(friend.id);
    try {
      const conv = await createPrivateConversation(friend.id);
      dispatch(upsertConversation(conv));
      dispatch(setActiveConversation(conv.id));
    } catch (e) {
      console.error(e);
    } finally {
      setStartingChat(null);
    }
  }, [dispatch, startingChat]);

  // Friends who don't already have a visible private conversation
  const existingPartnerIds = new Set(
    conversations
      .filter((c) => c.type === "PRIVATE")
      .flatMap((c) => (c.members || []).map((m) => m.userId))
  );
  const friendSuggestions = friends.filter((f) => !existingPartnerIds.has(f.id));

  const hasSearch = search.trim().length > 0;

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-900">{t("chat.title")}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowNewChat(true)}
            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
            title={t("chat.new_message")}
          >
            <PencilSquareIcon className="w-5 h-5" />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Đóng"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="px-3 py-2">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder={t("chat.search_conversations")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-100 rounded-full pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Conversation list */}
        <div className="px-2 py-1 space-y-0.5">
          {conversationsLoading && conversations.length === 0 ? (
            <div className="flex justify-center items-center h-24">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 && !hasSearch ? null : filtered.length === 0 ? (
            <div className="text-center text-sm text-gray-400 py-6">{t("chat.no_results")}</div>
          ) : (
            filtered.map((conv) => (
              <ConversationItem
                key={conv.id}
                conversation={conv}
                active={conv.id === activeId}
                onClick={() => dispatch(setActiveConversation(conv.id))}
                isOnline={conv.type === "PRIVATE"
                  ? conv.members?.some((m) => m.userId !== myUserId && onlineIds.has(m.userId))
                  : false}
              />
            ))
          )}
        </div>

        {/* Friends section — shown when not searching */}
        {!hasSearch && friendSuggestions.length > 0 && (
          <div className="px-2 pt-2 pb-3 border-t border-gray-100 mt-1">
            <button
              onClick={() => setShowFriends((v) => !v)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hover:text-gray-600 transition-colors"
            >
              <span>{t("chat.friends_section")}</span>
              {showFriends
                ? <ChevronUpIcon className="w-3.5 h-3.5" />
                : <ChevronDownIcon className="w-3.5 h-3.5" />
              }
            </button>

            {showFriends && (
              <div className="space-y-0.5">
                {friendSuggestions.map((friend) => (
                  <div key={friend.id} className={startingChat === friend.id ? "opacity-50 pointer-events-none" : ""}>
                    <FriendRow friend={friend} onStartChat={handleStartFriendChat} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty state when no conversations AND no friends */}
        {!conversationsLoading && filtered.length === 0 && !hasSearch && friendSuggestions.length === 0 && (
          <div className="text-center text-sm text-gray-400 py-10 px-4">
            {t("chat.no_conversations")}
          </div>
        )}
      </div>

      {showNewChat && (
        <NewChatModal
          onClose={() => setShowNewChat(false)}
          onCreated={handleNewConversation}
        />
      )}
    </div>
  );
}
