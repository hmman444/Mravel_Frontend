import { useRef, useState } from "react";
import { timeAgo } from "../utils/utils";

export default function PlanComments({ me, comments = [], onAdd, onDelete }) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onAdd({ id: Date.now().toString(), user: me, text, createdAt: new Date().toISOString() });
    setText("");
  };

  return (
    <div className="mt-3">
      {/* input */}
      <form onSubmit={submit} className="flex gap-2">
        <img src={me.avatar} className="w-9 h-9 rounded-full object-cover" />
        <input
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Viết bình luận..."
          className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-sm outline-none"
        />
      </form>

      {/* list */}
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
                {c.user.id === me.id && (
                  <button className="hover:underline" onClick={() => onDelete(c.id)}>Xoá</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
