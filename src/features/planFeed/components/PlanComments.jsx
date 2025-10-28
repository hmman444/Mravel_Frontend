import { useRef, useState, useEffect } from "react";
import { usePlans } from "../hooks/usePlans";
import CommentItem from "./CommentItem";

export default function PlanComments({ me, planId, comments = [] }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isReady, setIsReady] = useState(false); // ✅ trạng thái chờ user
  const inputRef = useRef(null);
  const { sendComment } = usePlans();

  useEffect(() => {
    // Nếu chưa có me, đợi một chút (ví dụ chờ redux load)
    if (!me) {
      const timeout = setTimeout(() => setIsReady(true), 500); // đợi 0.5 giây
      return () => clearTimeout(timeout);
    }
    setIsReady(true);
  }, [me]);

  // Nếu chưa sẵn sàng thì chỉ hiển thị placeholder loading
  if (!isReady || !me) {
    return (
      <div className="mt-3 flex items-center gap-2 text-sm text-gray-500 animate-pulse">
        <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-600"></div>
        <div className="flex-1 h-9 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
      </div>
    );
  }

  // === Bình luận chính ===
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

  // === Trả lời bình luận ===
  const handleReply = async (parentId, replyText) => {
    const reply = {
      userId: me.id,
      userName: me.fullname || me.name,
      userAvatar: me.avatar,
      text: replyText,
      parentId,
    };
    console.log("💬 Sending reply:", reply);
    await sendComment(planId, reply);
    
  };

  return (
    <div className="mt-3">
      {/* Form bình luận */}
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
          className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-sm outline-none"
        />
      </form>

      {/* Danh sách bình luận */}
      <div className="mt-3 space-y-3">
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
