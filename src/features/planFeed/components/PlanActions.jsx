import { useState, useMemo } from "react";
import { reactionsMeta } from "../utils/reactionsMeta";
import { ChatBubbleLeftRightIcon, ShareIcon } from "@heroicons/react/24/outline";
import ReactionPicker from "./ReactionPicker";

export default function PlanActions({
  reactions = {},
  reactionUsers = [],
  myReaction,
  onReact,
  onCommentFocus,
  onShare,
}) {
  const [showPopup, setShowPopup] = useState(false);

  // Tổng số reaction
  const total = useMemo(
    () => Object.values(reactions).reduce((a, b) => a + b, 0),
    [reactions]
  );

  // Top 3 emoji phổ biến
  const top3 = useMemo(() => {
    const merged = { ...reactions };
    if (myReaction && !merged[myReaction]) merged[myReaction] = 1;
    return Object.entries(merged)
      .filter(([, n]) => n > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k]) => reactionsMeta[k]?.emoji)
      .join(" ");
  }, [reactions, myReaction]);

  const handleReact = (type) => onReact(type);

  return (
    <div className="relative">
      {/* Tổng reaction */}
      {total > 0 && (
        <div
          className="text-sm text-gray-500 dark:text-gray-400 mb-2 inline-flex items-center gap-1 cursor-pointer"
          onMouseEnter={() => setShowPopup(true)}
          onMouseLeave={() => setShowPopup(false)}
        >
          {top3 && <span>{top3}</span>}
          <span>{total}</span>
        </div>
      )}

      {/* Popup danh sách người đã react */}
      {showPopup && reactionUsers.length > 0 && (
        <div className="absolute z-20 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 border dark:border-gray-700 w-64 transition-all duration-200">
          {reactionUsers.map((u) => {
            const name = u.userName || "Người dùng";
            const avatar = u.userAvatar || "/src/assets/default-avatar.png";
            const reaction = reactionsMeta[u.type?.toLowerCase()];
            return (
              <div
                key={u.userId}
                className="flex items-center justify-between py-1 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md px-2"
              >
                <div className="flex items-center gap-2">
                  <img
                    src={avatar}
                    alt={name}
                    className="w-7 h-7 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                  />
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-lg">{reaction?.emoji}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {reaction?.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Các nút hành động */}
      <div className="flex border-t border-b dark:border-gray-700 mt-2">
        <ReactionPicker value={myReaction} onChange={handleReact} />

        <button
          onClick={onCommentFocus}
          className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center gap-1 text-gray-500 dark:text-gray-400"
        >
          <ChatBubbleLeftRightIcon className="w-4 h-4" /> Bình luận
        </button>

        <button
          onClick={onShare}
          className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center gap-1 text-gray-500 dark:text-gray-400"
        >
          <ShareIcon className="w-4 h-4" /> Chia sẻ
        </button>
      </div>
    </div>
  );
}
