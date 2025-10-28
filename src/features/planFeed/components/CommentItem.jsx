import { useState } from "react";
import { timeAgo } from "../utils/utils";

export default function CommentItem({ comment, me, onReply, level = 0 }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    onReply(comment.id, replyText);
    setReplyText("");
    setShowReplyInput(false);
  };

  return (
    <div className={`mt-3 ${level > 0 ? "ml-10" : ""}`}>
      <div className="flex items-start gap-2 relative">
        <div className="relative">
          <img
            src={comment.user.avatar}
            alt={comment.user.name}
            className="w-9 h-9 rounded-full object-cover"
          />

          {/* {comment.replies?.length > 0 && (
            <div
              className="absolute left-1/2 top-9 w-[60px] h-[40px] -translate-x-1/2 pointer-events-none"
            >
              <div className="absolute left-1/2 top-0 w-[2px] h-[20px] bg-gray-300 dark:bg-gray-600 -translate-x-1/2"></div>
              <div
                className="absolute left-1/2 top-[18px] w-[35px] h-[20px] border-l-[2px] border-b-[2px] border-gray-300 dark:border-gray-600 rounded-bl-lg"
                style={{ borderBottomLeftRadius: "10px" }}
              ></div>
            </div>
          )} */}
        </div>

        <div className="flex-1">
          <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-2xl inline-block max-w-[90%]">
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {comment.user.name}
            </div>
            <div className="text-sm text-gray-800 dark:text-gray-100">
              {comment.text}
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-1 flex gap-3 pl-1">
            <span>{timeAgo(comment.createdAt)}</span>
            <button
              onClick={() => setShowReplyInput(!showReplyInput)}
              className="hover:underline"
            >
              Trả lời
            </button>
          </div>

          {showReplyInput && (
            <form onSubmit={handleReplySubmit} className="flex gap-2 mt-2">
              <img
                src={me.avatar}
                alt={me.name}
                className="w-7 h-7 rounded-full object-cover"
              />
              <input
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Phản hồi bình luận..."
                className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm outline-none"
              />
            </form>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 space-y-2 relative">
              {comment.replies.map((r) => (
                <CommentItem
                  key={r.id ?? `${r.user?.id || r.userId}-${Math.random()}`}
                  comment={r}
                  me={me}
                  onReply={onReply}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
