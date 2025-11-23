import { useRef, useState, useEffect } from "react";
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
  const internalRef = useRef(null);
  const inputRef = externalRef || internalRef;
  const { sendComment } = usePlans();

  useEffect(() => {
    if (!me) {
      const timeout = setTimeout(() => setIsReady(true), 500);
      return () => clearTimeout(timeout);
    }
    setIsReady(true);
  }, [me]);

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
  };

  return (
    <div className="mt-3">
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

      {comments?.length > 0 && (
        <p className="mt-3 mb-1 text-xs text-gray-500 dark:text-gray-400">
          {comments.length} bình luận
        </p>
      )}

      <div className="mt-1 space-y-3">
        {comments.map((c) => (
          <CommentItem
            key={c.id ?? `${c.user?.id || c.userId}-${Math.random()}`}
            comment={c}
            me={me}
            onReply={handleReply}
            level={0}
          />
        ))}
      </div>
    </div>
  );
}
