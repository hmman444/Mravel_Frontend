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
import { showError } from "../../../utils/toastUtils";
import { PLANNER_CONV_ID } from "../planner";
import ConversationItem from "./ConversationItem";
import NewChatModal from "./NewChatModal";
import SafeAvatar from "./SafeAvatar";
import { PencilSquareIcon, MagnifyingGlassIcon, ChevronDownIcon, ChevronUpIcon, XMarkIcon } from "@heroicons/react/24/outline";

function FriendRow({ friend, onStartChat }) {
  return (
    <button
      onClick={() => onStartChat(friend)}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      <SafeAvatar src={friend.avatar} name={friend.fullname} size="md" bgClassName="bg-blue-400" />
      <span className="flex-1 text-left text-sm text-gray-700 truncate">{friend.fullname}</span>
    </button>
  );
}

export default function ConversationList({ activeId, onClose, showPlanner = false }) {
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
      showError(e?.response?.data?.message || t("common.error_occurred"));
    } finally {
      setStartingChat(null);
    }
  }, [dispatch, startingChat, t]);

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
              aria-label={t("common.close")}
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
          {/* Pinned Mravel Planner entry (only on the full chat page, hidden while searching) */}
          {showPlanner && !hasSearch && (
            <button
              onClick={() => dispatch(setActiveConversation(PLANNER_CONV_ID))}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left ${
                activeId === PLANNER_CONV_ID ? "bg-blue-50 hover:bg-blue-100" : "hover:bg-gray-100"
              }`}
            >
              <div className="relative flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primaryHover text-white shadow-sm">
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
                  <path d="M12 2L14.5 9L22 12L14.5 15L12 22L9.5 15L2 12L9.5 9L12 2Z" />
                </svg>
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-sm font-medium truncate ${activeId === PLANNER_CONV_ID ? "text-blue-700" : "text-gray-900"}`}>
                  {t("chat.planner_title")}
                </div>
                <div className="text-xs text-gray-500 truncate">{t("chat.planner_subtitle")}</div>
              </div>
            </button>
          )}

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
