import { useState, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useDispatch, useSelector } from "react-redux";
import { XMarkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { addMembers } from "../services/chatService";
import { loadFriends } from "../slices/chatSlice";
import { showError } from "../../../utils/toastUtils";
import SafeAvatar from "./SafeAvatar";

export default function AddMembersModal({ conversationId, members, onClose, onAdded }) {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const friends = useSelector((s) => s.chat.friends);
  const friendsLoaded = useSelector((s) => s.chat.friendsLoaded);

  // Load friends if not loaded
  useEffect(() => {
    if (!friendsLoaded) {
      dispatch(loadFriends());
    }
  }, [friendsLoaded, dispatch]);

  // Thành viên hiện tại
  const currentMemberIds = useMemo(
    () => new Set(members?.map((m) => m.userId) || []),
    [members]
  );

  // Bạn bè chưa là thành viên
  const available = useMemo(
    () => friends?.filter((f) => !currentMemberIds.has(f.id)) || [],
    [friends, currentMemberIds]
  );

  const toggleSelect = (userId) => {
    setSelected((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleAdd = async () => {
    if (selected.length === 0) return;
    try {
      setLoading(true);
      await addMembers(conversationId, selected);
      onAdded?.();
      onClose();
    } catch (e) {
      showError(e?.response?.data?.message || t("common.error_occurred"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:w-96 max-h-[90vh] flex flex-col shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 flex-shrink-0">
          <h2 className="font-semibold text-gray-900">{t("chat.add_member")}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {available.length === 0 ? (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">
              {t("chat.all_friends_already_members")}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {available.map((friend) => (
                <label
                  key={friend.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(friend.id)}
                    onChange={() => toggleSelect(friend.id)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-500 focus:ring-2 focus:ring-blue-400"
                  />
                  <div className="flex-1 min-w-0 flex items-center gap-3">
                    <SafeAvatar
                      src={friend.avatar}
                      name={friend.fullname}
                      size="lg"
                      bgClassName="bg-blue-400"
                      className="!w-10 !h-10"
                    />
                    <p className="font-medium text-sm text-gray-900 truncate">
                      {friend.fullname}
                    </p>
                  </div>
                  {selected.includes(friend.id) && (
                    <CheckIcon className="w-5 h-5 text-blue-500 flex-shrink-0" />
                  )}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-gray-100 flex gap-2 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors text-sm"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={handleAdd}
            disabled={selected.length === 0 || loading}
            className="flex-1 px-4 py-2.5 rounded-lg bg-blue-500 text-white font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
          >
            {loading ? t("chat.adding") : t("chat.add_count", { n: selected.length })}
          </button>
        </div>
      </div>
    </div>
  );
}
