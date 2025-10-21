import { useState, useEffect, useMemo } from "react";
import ReactionPicker from "./ReactionPicker";
import { reactionsMeta } from "../utils/reactionsMeta";
import { ChatBubbleLeftRightIcon, ShareIcon } from "@heroicons/react/24/outline";

export default function PlanActions({
  reactions = {},
  reactionUsers = [],
  currentUserId,
  onReact,
  onCommentFocus,
  onShare,
}) {
  // 👉 Tổng từ server
  const totalFromServer = useMemo(
    () => Object.values(reactions || {}).reduce((a, b) => a + b, 0),
    [reactions]
  );

  // 👉 Reaction ban đầu của user
  const initialReaction =
    reactionUsers.find((u) => u.userId === currentUserId)?.type || null;

  // 👉 State local
  const [myReaction, setMyReaction] = useState(initialReaction);
  const [localTotal, setLocalTotal] = useState(totalFromServer);
  const [showPopup, setShowPopup] = useState(false);

  // Đồng bộ khi dữ liệu server đổi
  useEffect(() => {
    setLocalTotal(totalFromServer);
  }, [totalFromServer]);

  // 👉 Click react / bỏ react
  const handleReact = (type) => {
    // Nếu ấn lại cùng icon → bỏ react
    if (type === myReaction || type === null) {
      setMyReaction(null);
      setLocalTotal((prev) => Math.max(prev - 1, 0));
      if (onReact) onReact(null);
    } else {
      // Nếu react mới
      const wasReacted = !!myReaction;
      setMyReaction(type);
      if (!wasReacted) setLocalTotal((prev) => prev + 1);
      if (onReact) onReact(type);
    }
  };

  // 👉 Tính top3 emoji phổ biến
  const top3 = useMemo(() => {
    const merged = { ...reactions };
    if (myReaction && !reactions[myReaction]) {
      merged[myReaction] = 1; // Thêm ảo nếu user react mà chưa có trong server
    }
    return Object.entries(merged)
      .filter(([, n]) => n > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([k]) => reactionsMeta[k]?.emoji)
      .join(" ");
  }, [reactions, myReaction]);

  const hasReactions = localTotal > 0;

  return (
    <div className="relative">
      {/* 👉 Dòng tổng react: chỉ hiển thị khi có */}
      {(hasReactions || myReaction) && (
        <div
          className="text-sm text-gray-500 dark:text-gray-400 mb-2 inline-flex items-center gap-1 cursor-pointer select-none"
          onMouseEnter={() => setShowPopup(true)}
          onMouseLeave={() => setShowPopup(false)}
        >
          {top3 && <span>{top3}</span>}
          <span>{localTotal}</span>
        </div>
      )}

      {/* Popup danh sách người react */}
      {showPopup && reactionUsers.length > 0 && (
        <div className="absolute z-10 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-3 border dark:border-gray-700 w-56">
          {reactionUsers.map((u) => (
            <div key={u.userId} className="flex items-center gap-2 mb-1">
              <img src={u.userAvatar} className="w-6 h-6 rounded-full" />
              <span className="text-sm text-gray-700 dark:text-gray-200">
                {u.userName}
              </span>
              <span>{reactionsMeta[u.type]?.emoji}</span>
            </div>
          ))}
        </div>
      )}

      {/* 👉 Các nút hành động */}
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
