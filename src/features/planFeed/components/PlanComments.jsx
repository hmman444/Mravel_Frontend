import { useRef, useState, useEffect, useMemo } from "react";
import { usePlans } from "../hooks/usePlans";
import CommentItem from "./CommentItem";

export default function PlanComments({
  me,
  planId,
  comments = [],
  inputRef: externalRef,
}) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // đóng/mở toàn bộ khu bình luận
  const [showComments, setShowComments] = useState(false);

  const internalRef = useRef(null);
  const inputRef = externalRef || internalRef;
  const { sendComment } = usePlans();

  // ⬇️ luôn gọi useMemo TRƯỚC mọi return có điều kiện
  const sortedComments = useMemo(() => {
    if (!comments) return [];
    return [...comments].sort((a, b) => {
      const ta = new Date(a.createdAt || 0).getTime();
      const tb = new Date(b.createdAt || 0).getTime();
      return ta - tb; // cũ -> mới
    });
  }, [comments]);

  useEffect(() => {
    if (!me) {
      const timeout = setTimeout(() => setIsReady(true), 500);
      return () => clearTimeout(timeout);
    }
    setIsReady(true);
  }, [me]);

  // ❗ Từ đây trở xuống KHÔNG còn hook nào nữa
  if (!isReady || !me) {
    return (
      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 animate-pulse">
        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600" />
        <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-600 rounded-full" />
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    try {
      const comment = {
        userId: me.id,
        userName: me.fullname || me.name,
        userAvatar: me.avatar,
        text,
      };
      await sendComment(planId, comment);
      setText("");
      // gửi comment mới thì tự mở khu bình luận
      setShowComments(true);
    } catch (err) {
      console.error(err);
      alert("Không thể gửi bình luận!");
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (parentId, replyText) => {
    const reply = {
      userId: me.id,
      userName: me.fullname || me.name,
      userAvatar: me.avatar,
      text: replyText,
      parentId,
    };
    await sendComment(planId, reply);
    setShowComments(true);
  };

  // helper tạo key ổn định, không dùng Math.random nữa
  const getCommentKey = (c, index) =>
    c.id ??
    c._id ??
    (c.userId || c.user?.id || "u") + "-" + (c.createdAt || index);

  return (
    <div className="mt-3">
      {/* Ô nhập bình luận mới */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <img
          src={me.avatar}
          className="w-9 h-9 rounded-full object-cover"
          alt="avatar"
        />
        <input
          disabled={loading}
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Viết bình luận..."
          className="
            flex-1 bg-gray-100 dark:bg-gray-800
            rounded-full px-4 py-2 text-sm outline-none
            text-gray-800 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:ring-2 focus:ring-sky-400
          "
        />
      </form>

      {/* Tổng số + nút xem/ẩn bình luận */}
      {sortedComments.length > 0 && (
        <div className="mt-3 mb-1 flex items-center justify-between">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {sortedComments.length} bình luận
          </p>

          <button
            type="button"
            onClick={() => setShowComments((prev) => !prev)}
            className="text-xs text-sky-600 dark:text-sky-400 hover:underline"
          >
            {showComments
              ? "Ẩn bình luận"
              : `Xem bình luận (${sortedComments.length})`}
          </button>
        </div>
      )}

      {/* Khu comment có transition mượt */}
      <div
        className={`
          transition-all duration-300 ease-out overflow-hidden
          ${
            showComments
              ? "max-h-[3000px] opacity-100 mt-1"
              : "max-h-0 opacity-0 mt-0"
          }
        `}
      >
        {showComments && sortedComments.length > 0 && (
          <div className="space-y-3">
            {sortedComments.map((c, idx) => (
              <CommentItem
                key={getCommentKey(c, idx)}
                comment={c}
                me={me}
                onReply={handleReply}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
