// CommentItem.jsx
import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { timeAgo } from "../utils/utils";

/**
 * 1 thread comment (1 root + replies phẳng)
 */
export default function CommentItem({ comment, me, onReply }) {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyParent, setReplyParent] = useState(null); // { id, user }
  const [showReplies, setShowReplies] = useState(false); // bấm "Xem phản hồi" thì mở, không cho đóng

  const replyInputRef = useRef(null);

  // khi bật ô reply thì focus vào input
  useEffect(() => {
    if (showReplyInput && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [showReplyInput]);

  // ==== ROOT USER + AVATAR (fallback nhiều tầng) ====
  const rootUser = comment.user || {};
  const rootAvatar =
    rootUser.avatar ||
    comment.userAvatar || // nếu BE trả ở dạng phẳng
    comment.avatar || // fallback thêm
    "/default-avatar.png";
  const rootName = rootUser.name || comment.userName || "Người dùng";

  // Flatten + sort replies theo thời gian (cũ -> mới)
  const flatReplies = useMemo(() => {
    if (!comment.replies || comment.replies.length === 0) return [];

    const result = [];
    const queue = comment.replies.map((child) => ({
      node: child,
      parentUser: rootUser,
    }));

    while (queue.length) {
      const { node, parentUser } = queue.shift();
      result.push({ node, parentUser });

      if (node.replies && node.replies.length > 0) {
        node.replies.forEach((child) =>
          queue.push({ node: child, parentUser: node.user || parentUser })
        );
      }
    }

    // sort theo createdAt
    result.sort((a, b) => {
      const ta = new Date(a.node.createdAt || 0).getTime();
      const tb = new Date(b.node.createdAt || 0).getTime();
      return ta - tb;
    });

    return result;
  }, [comment.replies, rootUser]);

  const hasReplies = flatReplies.length > 0;

  const handleClickReplyRoot = () => {
    setShowReplyInput(true);
    setReplyParent({ id: comment.id, user: rootUser });
    if (hasReplies) setShowReplies(true);
  };

  const handleClickReplyChild = (child) => {
    setShowReplyInput(true);
    setReplyParent({ id: child.id, user: child.user });
    if (hasReplies) setShowReplies(true);
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyParent) return;

    onReply(replyParent.id, replyText);
    setReplyText("");
    setShowReplyInput(false);
    if (hasReplies) setShowReplies(true);
  };

  return (
    <div className="mt-3">
      {/* ===== ROOT COMMENT ===== */}
      <div className="flex items-start gap-2">
        {/* Avatar gốc (không còn đường nối) */}
        <Link
          to={rootUser?.id ? `/profile/${rootUser.id}` : "#"}
          onClick={(e) => {
            if (!rootUser?.id) e.preventDefault();
            e.stopPropagation();
          }}
          className="shrink-0"
          title={rootUser?.id ? `Xem trang cá nhân ${rootName}` : ""}
        >
          <img
            src={rootAvatar}
            alt={rootName}
            className="w-9 h-9 rounded-full object-cover cursor-pointer hover:opacity-90 transition"
          />
        </Link>

        <div className="flex-1">
          <div
            className="
              bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-2xl
              inline-block w-fit
              max-w-[480px] sm:max-w-[520px]
              whitespace-pre-wrap break-words
            "
          >
            <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {rootUser?.id ? (
                <Link
                  to={`/profile/${rootUser.id}`}
                  className="hover:underline"
                  onClick={(e) => e.stopPropagation()}
                  title="Xem trang cá nhân"
                >
                  {rootName}
                </Link>
              ) : (
                rootName
              )}
            </div>
            <div className="text-sm text-gray-800 dark:text-gray-100">
              {comment.text}
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-1 flex gap-3 pl-1">
            <span>{timeAgo(comment.createdAt)}</span>
            <button
              onClick={handleClickReplyRoot}
              className="hover:underline"
            >
              Trả lời
            </button>
          </div>

          {/* Nút xem phản hồi */}
          {hasReplies && !showReplies && !showReplyInput && (
            <button
              type="button"
              onClick={() => setShowReplies(true)}
              className="mt-1 text-xs text-sky-600 dark:text-sky-400 hover:underline"
            >
              Xem phản hồi ({flatReplies.length})
            </button>
          )}

          {/* ===== REPLIES + Ô REPLY ===== */}
          <div
            className={`
              transition-all duration-200 ease-out overflow-hidden
              ${
                showReplies || showReplyInput
                  ? "max-h-[2000px] opacity-100 mt-2"
                  : "max-h-0 opacity-0"
              }
            `}
          >
            {(showReplies || showReplyInput) && (
              <div className="mt-2 pl-10 space-y-2">
                {flatReplies.map(({ node, parentUser }, idx) => (
                  <ReplyItem
                    key={node.id || node._id || idx}
                    reply={node}
                    parentUser={parentUser}
                    onClickReply={handleClickReplyChild}
                  />
                ))}

                {showReplyInput && replyParent && (
                  <div className="mt-1">
                    <div className="mb-1 text-xs text-sky-600 dark:text-sky-400 font-semibold">
                      Đang trả lời{" "}
                      {replyParent.user?.id ? (
                        <Link
                          to={`/profile/${replyParent.user.id}`}
                          className="hover:underline"
                        >
                          @{replyParent.user.name}
                        </Link>
                      ) : (
                        `@${replyParent.user?.name || "người dùng"}`
                      )}
                    </div>

                    <form
                      onSubmit={handleReplySubmit}
                      className="flex gap-2 items-center"
                    >
                      <img
                        src={me.avatar}
                        alt={me.fullname || me.name}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                      <input
                        ref={replyInputRef}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Phản hồi..."
                        className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm outline-none"
                      />
                    </form>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Reply item
 */
function ReplyItem({ reply, parentUser, onClickReply }) {
  // ==== USER + AVATAR (fallback nhiều field) ====
  const user = reply.user || {};
  const name = user.name || reply.userName || "Người dùng";

  const avatar =
    user.avatar ||
    reply.userAvatar || // BE có thể trả phẳng
    reply.avatar ||
    parentUser?.avatar ||
    parentUser?.userAvatar ||
    "/default-avatar.png";

  const parentName =
    parentUser?.name || parentUser?.userName || "người dùng";

  return (
    <div className="flex items-start gap-2">
      {user?.id ? (
        <Link
          to={`/profile/${user.id}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0"
          title={`Xem trang cá nhân ${name}`}
        >
          <img
            src={avatar}
            alt={name}
            className="w-7 h-7 rounded-full object-cover cursor-pointer hover:opacity-90 transition"
          />
        </Link>
      ) : (
        <img
          src={avatar}
          alt={name}
          className="w-7 h-7 rounded-full object-cover"
        />
      )}

      <div className="flex-1">
        <div
          className="
            bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-2xl
            inline-block w-fit
            max-w-[480px] sm:max-w-[520px]
            whitespace-pre-wrap break-words
          "
        >
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {user?.id ? (
              <Link
                to={`/profile/${user.id}`}
                className="hover:underline"
                onClick={(e) => e.stopPropagation()}
                title="Xem trang cá nhân"
              >
                {name}
              </Link>
            ) : (
              name
            )}
          </div>
          <div className="text-sm text-gray-800 dark:text-gray-100">
            {parentUser?.id ? (
              <Link
                to={`/profile/${parentUser.id}`}
                className="text-sky-600 dark:text-sky-400 font-semibold mr-1 hover:underline"
              >
                @{parentName}
              </Link>
            ) : (
              <span className="text-sky-600 dark:text-sky-400 font-semibold mr-1">
                @{parentName}
              </span>
            )}
            {reply.text}
          </div>
        </div>

        {/* Thời gian + nút trả lời cho reply */}
        <div className="text-[11px] text-gray-500 mt-1 flex gap-3 pl-1">
          <span>{timeAgo(reply.createdAt)}</span>
          <button
            onClick={() => onClickReply(reply)}
            className="hover:underline"
          >
            Trả lời
          </button>
        </div>
      </div>
    </div>
  );
}
