import { reactionsMeta } from "../../utils/reactionsMeta";
import ReactionPicker from "./ReactionPicker";
import { ChatBubbleLeftRightIcon, ShareIcon } from "@heroicons/react/24/outline";

export default function PlanActions({ reactions, onReact, onCommentFocus, onShare }) {
  const total = Object.values(reactions).reduce((a, b) => a + b, 0);
  const top3 = Object.entries(reactions)
    .filter(([, n]) => n > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => reactionsMeta[k]?.emoji)
    .join(" ");

  return (
    <div>
      {/* Summary */}
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
        {total > 0 && <span className="mr-2">{top3} {total}</span>}
      </div>

      {/* Buttons */}
      <div className="flex border-t border-b dark:border-gray-700">
        <ReactionPicker onPick={onReact} />
        
        <button
          onClick={onCommentFocus}
          className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center gap-1"
        >
          <ChatBubbleLeftRightIcon className="w-4 h-4" /> Bình luận
        </button>
        <button
          onClick={onShare}
          className="px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-sm flex items-center gap-1"
        >
          <ShareIcon className="w-4 h-4" /> Chia sẻ
        </button>
      </div>
    </div>
  );
}
