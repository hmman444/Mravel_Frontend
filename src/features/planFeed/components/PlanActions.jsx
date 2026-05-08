import {
  ChatBubbleLeftRightIcon,
  ShareIcon,
} from "@heroicons/react/24/outline";
import ReactionPicker from "./ReactionPicker";
import ReactionSummaryPopupTrigger from "./ReactionSummaryPopupTrigger";

export default function PlanActions({
  reactions = {},
  reactionUsers = [],
  myReaction,
  onReact,
  onCommentFocus,
  onShare,
}) {
  const handleReact = (type) => onReact(type);

  return (
    <div className="relative">
      <ReactionSummaryPopupTrigger
        reactions={reactions}
        reactionUsers={reactionUsers}
        currentReaction={myReaction}
        className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 inline-flex items-center gap-1 cursor-pointer"
        rootClassName="relative"
        popupClassName="absolute z-20 translate-y-1"
      />

      <div className="mt-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3">
        <ReactionPicker value={myReaction} onChange={handleReact} />

        <button
          type="button"
          onClick={onCommentFocus}
          className="
            px-3 py-2 rounded-lg
            hover:bg-blue-50 dark:hover:bg-blue-900/20
            text-sm font-medium flex items-center gap-1.5
            text-gray-600 dark:text-gray-300
            hover:text-sky-600 dark:hover:text-sky-400
            transition-colors duration-150
          "
        >
          <ChatBubbleLeftRightIcon className="w-4 h-4" /> Bình luận
        </button>

        <button
          type="button"
          onClick={onShare}
          className="
            px-3 py-2 rounded-lg
            hover:bg-blue-50 dark:hover:bg-blue-900/20
            text-sm font-medium flex items-center gap-1.5
            text-gray-600 dark:text-gray-300
            hover:text-sky-600 dark:hover:text-sky-400
            transition-colors duration-150
          "
        >
          <ShareIcon className="w-4 h-4" /> Chia sẻ
        </button>
      </div>
    </div>
  );
}
