import { useRef, useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { usePlans } from "../hooks/usePlans";
import CommentItem from "./CommentItem";
import { showError } from "../../../utils/toastUtils";

export default function PlanComments({
  me,
  planId,
  comments = [],
  inputRef: externalRef,
}) {
  const { t } = useTranslation();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // đóng/mở toàn bộ khu bình luận
  const [showComments, setShowComments] = useState(false);
  const [sortBy, setSortBy] = useState("OLDEST"); // OLDEST | NEWEST | MOST_REACTIONS

  const internalRef = useRef(null);
  const inputRef = externalRef || internalRef;
  const { sendComment, sendCommentReact } = usePlans();

  const totalReactions = (c) =>
    Object.values(c.reactions || {}).reduce((a, b) => a + b, 0);

  const sortedComments = useMemo(() => {
    if (!comments) return [];
    const arr = [...comments];
    if (sortBy === "NEWEST")
      return arr.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    if (sortBy === "MOST_REACTIONS")
      return arr.sort((a, b) => totalReactions(b) - totalReactions(a));
    // OLDEST (default)
    return arr.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  }, [comments, sortBy]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!me) {
      const timeout = setTimeout(() => setIsReady(true), 500);
      return () => clearTimeout(timeout);
    }
    setIsReady(true);
  }, [me]);

  if (!isReady || !me) {
    return (
      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 animate-pulse">
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
    } catch {
      showError(t("feed.comment.sendFailed"));
    } finally {
      setLoading(false);
    }
  };

  const handleCommentReact = (commentId, type) => sendCommentReact(planId, commentId, type);

  const handleReply = async (parentId, replyText) => {
    const reply = {
      userId: me.id,
      userName: me.fullname || me.name,
      userAvatar: me.avatar,
      text: replyText,
      parentId,
    };
    try {
      await sendComment(planId, reply);
      setShowComments(true);
    } catch {
      showError(t("feed.comment.sendFailed"));
    }
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
          placeholder={t("feed.comment.placeholder")}
          className="
            flex-1 bg-gray-100 dark:bg-gray-800
            rounded-full px-4 py-2 text-sm outline-none
            text-gray-800 dark:text-gray-100
            placeholder:text-gray-400 dark:placeholder:text-gray-500
            focus:ring-2 focus:ring-sky-400
          "
        />
      </form>

      {/* Header: count + sort controls + show/hide */}
      {sortedComments.length > 0 && (
        <div className="mt-3 mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          {/* Count + toggle */}
          <button
            type="button"
            onClick={() => setShowComments((prev) => !prev)}
            className="text-xs text-sky-600 dark:text-sky-400 hover:underline shrink-0"
          >
            {showComments
              ? t("feed.comment.hide")
              : t("feed.comment.show", { count: sortedComments.length })}
          </button>

          {/* Sort combobox — only visible when expanded */}
          {showComments && (
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ml-auto text-[11px] px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 cursor-pointer outline-none focus:ring-1 focus:ring-sky-400"
            >
              <option value="OLDEST">{t("feed.comment.sort.oldest")}</option>
              <option value="NEWEST">{t("feed.comment.sort.newest")}</option>
              <option value="MOST_REACTIONS">{t("feed.comment.sort.mostReactions")}</option>
            </select>
          )}
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
                onReact={handleCommentReact}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
