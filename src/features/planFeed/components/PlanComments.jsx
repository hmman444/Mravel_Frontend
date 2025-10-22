import { useRef, useState } from "react";
import { usePlans } from "../hooks/usePlans";
import { timeAgo } from "../utils/utils";

export default function PlanComments({ me, planId, comments = [] }) {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const { sendComment } = usePlans();

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

  return (
    <div className="mt-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <img src={me.avatar} className="w-9 h-9 rounded-full object-cover" />
        <input
        disabled={loading}
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Viết bình luận..."
          className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-sm outline-none"
        />
      </form>

      <div className="mt-3 space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-2">
            <img src={c.user.avatar} className="w-9 h-9 rounded-full object-cover" />
            <div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-3 py-2">
                <div className="text-sm font-semibold">{c.user.name}</div>
                <div className="text-sm">{c.text}</div>
              </div>
              <div className="text-xs text-gray-500 mt-1 flex gap-3">
                <span>{timeAgo(c.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
