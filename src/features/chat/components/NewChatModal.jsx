import { useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSelector, useDispatch } from "react-redux";
import { createPrivateConversation, createGroupConversation, searchUsers } from "../services/chatService";
import { loadFriends } from "../slices/chatSlice";
import { showError } from "../../../utils/toastUtils";
import SafeAvatar from "./SafeAvatar";
import { XMarkIcon, MagnifyingGlassIcon, UserGroupIcon, CheckIcon } from "@heroicons/react/24/outline";

function UserAvatar({ user }) {
  return <SafeAvatar src={user.avatar} name={user.fullname} size="md" bgClassName="bg-blue-400" />;
}

function UserResult({ user, selected, onToggle, badge }) {
  return (
    <button
      onClick={() => onToggle(user)}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
    >
      <UserAvatar user={user} />
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-medium text-gray-900 truncate">{user.fullname}</p>
        {badge && <p className="text-xs text-blue-500 truncate">{badge}</p>}
        {!badge && user.email && <p className="text-xs text-gray-400 truncate">{user.email}</p>}
      </div>
      {selected && <CheckIcon className="w-4 h-4 text-blue-500 flex-shrink-0" />}
    </button>
  );
}

export default function NewChatModal({ onClose, onCreated, initialMode = "private", initialSelected = [] }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { friends, friendsLoaded } = useSelector((s) => s.chat);

  const [mode, setMode] = useState(initialMode);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(initialSelected);
  const [groupName, setGroupName] = useState("");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!friendsLoaded) dispatch(loadFriends());
  }, [dispatch, friendsLoaded]);

  const doSearch = useCallback(async (q) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const data = await searchUsers(q);
      setResults(Array.isArray(data) ? data : []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search, doSearch]);

  const toggleUser = (user) => {
    if (mode === "private") {
      setSelected([user]);
    } else {
      setSelected((prev) =>
        prev.some((u) => u.id === user.id)
          ? prev.filter((u) => u.id !== user.id)
          : [...prev, user]
      );
    }
  };

  const handleCreate = async () => {
    if (selected.length === 0) return;
    setCreating(true);
    try {
      let conv;
      if (mode === "private") {
        conv = await createPrivateConversation(selected[0].id);
      } else {
        if (!groupName.trim()) return;
        conv = await createGroupConversation(
          groupName.trim(),
          selected.map((u) => u.id)
        );
      }
      onCreated(conv);
    } catch (e) {
      showError(e?.response?.data?.message || t("common.error_occurred"));
    } finally {
      setCreating(false);
    }
  };

  const canCreate = mode === "private"
    ? selected.length === 1
    : selected.length >= 1 && groupName.trim();

  const isSearching = search.trim().length > 0;

  // Friends not already selected, for the suggestions section
  const friendSuggestions = friends.filter(
    (f) => !selected.some((s) => s.id === f.id)
  );

  return (
    <div className="fixed inset-0 bg-black/40 z-[200] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">{t("chat.new_message")}</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Mode toggle */}
        <div className="flex gap-1 px-5 pt-4">
          <button
            onClick={() => { setMode("private"); setSelected([]); }}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors ${mode === "private" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {t("chat.private_chat")}
          </button>
          <button
            onClick={() => { setMode("group"); setSelected([]); }}
            className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1 ${mode === "group" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            <UserGroupIcon className="w-4 h-4" />
            {t("chat.group_chat")}
          </button>
        </div>

        {/* Group name */}
        {mode === "group" && (
          <div className="px-5 pt-3">
            <input
              type="text"
              placeholder={t("chat.group_name_placeholder")}
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        )}

        {/* Selected tags */}
        {selected.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-5 pt-3">
            {selected.map((u) => (
              <span key={u.id} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs rounded-full px-2 py-1">
                {u.fullname}
                <button onClick={() => toggleUser(u)}>
                  <XMarkIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Search */}
        <div className="px-5 pt-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder={t("chat.search_users")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-100 rounded-xl pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />
          </div>
        </div>

        {/* Results / Friends section */}
        <div className="flex-1 overflow-y-auto px-3 py-2 min-h-[120px]">
          {isSearching ? (
            loading ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : results.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-6">{t("chat.no_users_found")}</p>
            ) : (
              results.map((user) => (
                <UserResult
                  key={user.id}
                  user={user}
                  selected={selected.some((u) => u.id === user.id)}
                  onToggle={toggleUser}
                />
              ))
            )
          ) : (
            <>
              {friendSuggestions.length > 0 && (
                <>
                  <p className="px-3 pt-1 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    {t("chat.friends")}
                  </p>
                  {friendSuggestions.map((friend) => (
                    <UserResult
                      key={friend.id}
                      user={friend}
                      selected={selected.some((u) => u.id === friend.id)}
                      onToggle={toggleUser}
                      badge={t("chat.friend_badge")}
                    />
                  ))}
                </>
              )}
              {friendSuggestions.length === 0 && (
                <p className="text-center text-sm text-gray-400 py-6">{t("chat.search_users")}</p>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-100">
          <button
            onClick={handleCreate}
            disabled={!canCreate || creating}
            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              canCreate && !creating
                ? "bg-blue-500 hover:bg-blue-600 text-white"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {creating ? t("chat.creating") : mode === "private" ? t("chat.start_chat") : t("chat.create_group")}
          </button>
        </div>
      </div>
    </div>
  );
}
