// CommentItem.jsx
import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { timeAgo } from "../utils/utils";
import { REACTIONS, reactionsMeta } from "../utils/reactionsMeta";
import ReactionSummaryPopupTrigger from "./ReactionSummaryPopupTrigger";

const REACTION_COLORS = {
  like: "text-sky-500",
  love: "text-rose-500",
  haha: "text-amber-500",
  wow: "text-amber-500",
  sad: "text-amber-400",
  angry: "text-orange-600",
};

const ROOT_CONNECTOR = { left: "-27px", top: 0, width: "27px", height: "14px" };
const REPLY_CONNECTOR = { left: "-23px", top: 0, width: "23px", height: "14px" };

function ReactionBadge({ reactions, reactionUsers = [] }) {
  return (
    <ReactionSummaryPopupTrigger
      reactions={reactions}
      reactionUsers={reactionUsers}
      className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 cursor-pointer select-none"
      rootClassName="relative inline-flex"
      popupClassName="absolute top-full left-0 z-20 translate-y-1"
    />
  );
}

function MiniReactionPicker({ value, onChange }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);

  const current = value ? reactionsMeta[value] : null;
  const colorClass = current ? (REACTION_COLORS[value] ?? "text-sky-500") : "";

  const show = () => {
    clearTimeout(timerRef.current);
    setOpen(true);
  };
  const hide = () => {
    timerRef.current = setTimeout(() => setOpen(false), 150);
  };

  const handlePick = (key) => {
    onChange(value === key ? null : key);
    setOpen(false);
  };

  return (
    <div className="relative inline-block" onMouseEnter={show} onMouseLeave={hide}>
      <button
        type="button"
        onClick={() => handlePick(value || "like")}
        className={`
          text-xs font-semibold transition-colors duration-100
          ${
            current
              ? colorClass
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          }
        `}
      >
        {current ? `${current.emoji} ${current.label}` : t("feed.reaction.like")}
      </button>

      <div
        className={`
          absolute bottom-full left-0 mb-1.5
          bg-white dark:bg-gray-900
          rounded-full shadow-xl border border-gray-200/80 dark:border-gray-700
          px-2.5 py-2 flex gap-2 z-30 whitespace-nowrap
          transition-all duration-150 ease-out origin-bottom-left
          ${open ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}
        `}
      >
        {REACTIONS.map((r) => (
          <button
            key={r.key}
            type="button"
            title={r.label}
            onClick={() => handlePick(r.key)}
            className={`
              text-xl transition-transform duration-100
              hover:scale-125 active:scale-90
              ${value === r.key ? "scale-110" : ""}
            `}
          >
            {r.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

function ReplyItem({ reply, parentUser, onClickReply, onReact, connectorStyle }) {
  const { t } = useTranslation();
  const [showSubReplies, setShowSubReplies] = useState(false);
  const [myReaction, setMyReaction] = useState(reply.myReaction ?? null);
  useEffect(() => {
    setMyReaction(reply.myReaction ?? null);
  }, [reply.myReaction]);

  const user = reply.user || {};
  const name = user.name || reply.userName || t("feed.user.default");
  const avatar =
    user.avatar || reply.userAvatar || reply.avatar || parentUser?.avatar || "/default-avatar.png";
  const parentName = parentUser?.name || parentUser?.userName || t("feed.user.default");

  const directSubReplies = reply.replies || [];
  const hasSubReplies = directSubReplies.length > 0;

  const handleReact = (newType) => {
    setMyReaction(newType);
    onReact(reply.id, newType ?? "like");
  };

  return (
    <div className="relative flex gap-2">
      <div
        className="absolute border-l-2 border-b-2 border-gray-300 dark:border-gray-600 rounded-bl-lg pointer-events-none"
        style={connectorStyle}
      />

      <div className="flex flex-col items-center shrink-0 w-7">
        {user?.id ? (
          <Link
            to={`/profile/${user.id}`}
            onClick={(e) => e.stopPropagation()}
            title={t("feed.user.viewProfileOf", { name })}
          >
            <img
              src={avatar}
              alt={name}
              className="w-7 h-7 rounded-full object-cover hover:opacity-90 transition"
            />
          </Link>
        ) : (
          <img src={avatar} alt={name} className="w-7 h-7 rounded-full object-cover" />
        )}
        {showSubReplies && hasSubReplies && (
          <div className="w-0.5 flex-1 mt-1 min-h-4 rounded-b-full bg-gray-300 dark:bg-gray-600" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-2xl inline-block w-fit max-w-[460px] sm:max-w-[500px] whitespace-pre-wrap break-words">
          <div className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {user?.id ? (
              <Link
                to={`/profile/${user.id}`}
                className="hover:underline"
                onClick={(e) => e.stopPropagation()}
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

        <div className="text-[11px] text-gray-500 mt-1 flex items-center gap-3 pl-1">
          <span className="dark:text-gray-400">{timeAgo(reply.createdAt)}</span>
          <MiniReactionPicker value={myReaction} onChange={handleReact} />
          <button
            onClick={() => onClickReply(reply)}
            className="font-semibold hover:underline text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {t("feed.comment.reply")}
          </button>
          <ReactionBadge reactions={reply.reactions} reactionUsers={reply.reactionUsers} />
        </div>

        {hasSubReplies && !showSubReplies && (
          <button
            type="button"
            onClick={() => setShowSubReplies(true)}
            className="mt-1 text-xs text-sky-600 dark:text-sky-400 hover:underline"
          >
            {t("feed.comment.viewReplies", { count: directSubReplies.length })}
          </button>
        )}

        {showSubReplies && hasSubReplies && (
          <div className="mt-2 space-y-2">
            {directSubReplies.map((subReply, idx) => (
              <ReplyItem
                key={subReply.id ?? subReply._id ?? idx}
                reply={subReply}
                parentUser={user}
                onClickReply={onClickReply}
                onReact={onReact}
                connectorStyle={REPLY_CONNECTOR}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CommentItem({ comment, me, onReply, onReact }) {
  const { t } = useTranslation();
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyParent, setReplyParent] = useState(null);
  const [showReplies, setShowReplies] = useState(false);

  const [myReaction, setMyReaction] = useState(comment.myReaction ?? null);
  useEffect(() => {
    setMyReaction(comment.myReaction ?? null);
  }, [comment.myReaction]);

  const replyInputRef = useRef(null);
  useEffect(() => {
    if (showReplyInput && replyInputRef.current) replyInputRef.current.focus();
  }, [showReplyInput]);

  const rootUser = comment.user || {};
  const rootAvatar =
    rootUser.avatar || comment.userAvatar || comment.avatar || "/default-avatar.png";
  const rootName = rootUser.name || comment.userName || t("feed.user.default");

  const directReplies = comment.replies || [];
  const hasReplies = directReplies.length > 0;
  const showThread = showReplies || showReplyInput;

  const openReplyTo = (id, user) => {
    setReplyParent({ id, user });
    setShowReplyInput(true);
    setShowReplies(true);
  };

  const handleReplySubmit = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !replyParent) return;
    onReply(replyParent.id, replyText);
    setReplyText("");
    setShowReplyInput(false);
    setShowReplies(true);
  };

  const handleReact = (newType) => {
    setMyReaction(newType);
    onReact(comment.id, newType ?? "like");
  };

  return (
    <div className="mt-3 flex gap-2">
      <div className="flex flex-col items-center shrink-0 w-9">
        <Link
          to={rootUser?.id ? `/profile/${rootUser.id}` : "#"}
          onClick={(e) => {
            if (!rootUser?.id) e.preventDefault();
            e.stopPropagation();
          }}
          title={rootUser?.id ? t("feed.user.viewProfileOf", { name: rootName }) : ""}
        >
          <img
            src={rootAvatar}
            alt={rootName}
            className="w-9 h-9 rounded-full object-cover cursor-pointer hover:opacity-90 transition"
          />
        </Link>
        {showThread && (
          <div className="w-0.5 flex-1 mt-1 min-h-4 rounded-b-full bg-gray-300 dark:bg-gray-600" />
        )}
      </div>

      <div className="flex-1 min-w-0 pb-1">
        <div className="bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-2xl inline-block w-fit max-w-[480px] sm:max-w-[520px] whitespace-pre-wrap break-words">
          <div className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {rootUser?.id ? (
              <Link
                to={`/profile/${rootUser.id}`}
                className="hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {rootName}
              </Link>
            ) : (
              rootName
            )}
          </div>
          <div className="text-sm text-gray-800 dark:text-gray-100">{comment.text}</div>
        </div>

        <div className="text-xs text-gray-500 mt-1 flex items-center gap-3 pl-1">
          <span className="dark:text-gray-400">{timeAgo(comment.createdAt)}</span>
          <MiniReactionPicker value={myReaction} onChange={handleReact} />
          <button
            onClick={() => openReplyTo(comment.id, rootUser)}
            className="font-semibold hover:underline text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {t("feed.comment.reply")}
          </button>
          <ReactionBadge reactions={comment.reactions} reactionUsers={comment.reactionUsers} />
        </div>

        {hasReplies && !showReplies && !showReplyInput && (
          <button
            type="button"
            onClick={() => setShowReplies(true)}
            className="mt-1 text-xs text-sky-600 dark:text-sky-400 hover:underline"
          >
            {t("feed.comment.viewReplies", { count: directReplies.length })}
          </button>
        )}

        <div
          className={`
            transition-all duration-200 ease-out overflow-hidden
            ${showThread ? "max-h-[3000px] opacity-100 mt-2" : "max-h-0 opacity-0"}
          `}
        >
          {showThread && (
            <div className="space-y-2">
              {directReplies.map((reply, idx) => (
                <ReplyItem
                  key={reply.id ?? reply._id ?? idx}
                  reply={reply}
                  parentUser={rootUser}
                  onClickReply={(r) => openReplyTo(r.id, r.user)}
                  onReact={onReact}
                  connectorStyle={ROOT_CONNECTOR}
                />
              ))}

              {showReplyInput && replyParent && (
                <div className="relative">
                  <div
                    className="absolute border-l-2 border-b-2 border-gray-300 dark:border-gray-600 rounded-bl-lg pointer-events-none"
                    style={ROOT_CONNECTOR}
                  />
                  <div>
                    <div className="mb-1 text-xs text-sky-600 dark:text-sky-400 font-semibold">
                      {t("feed.comment.replyingTo")}{" "}
                      {replyParent.user?.id ? (
                        <Link to={`/profile/${replyParent.user.id}`} className="hover:underline">
                          @{replyParent.user.name}
                        </Link>
                      ) : (
                        `@${replyParent.user?.name || t("feed.user.default")}`
                      )}
                    </div>
                    <form onSubmit={handleReplySubmit} className="flex gap-2 items-center">
                      <img
                        src={me.avatar}
                        alt={me.fullname || me.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0"
                      />
                      <input
                        ref={replyInputRef}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={t("feed.comment.replyPlaceholder")}
                        className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1 text-sm outline-none focus:ring-2 focus:ring-sky-400"
                      />
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
