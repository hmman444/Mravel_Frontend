import { useRef, useMemo } from "react";
import { MapPinIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

import PlanHeader from "./PlanHeader";
import PlanMedia from "./PlanMedia";
import PlanActions from "./PlanActions";
import PlanComments from "./PlanComments";

import { usePlans } from "../hooks/usePlans";
import { truncate } from "../utils/utils";

export default function PlanPostCard({ plan, me, onOpenDetail }) {
  const { sendReact, sendComment } = usePlans();
  const commentRef = useRef(null);
  const desc = truncate(plan.description || "", 200);

  const myReaction = useMemo(() => {
    if (!plan.reactionUsers || !me?.id) return null;
    const found = plan.reactionUsers.find(
      (u) => Number(u.userId) === Number(me.id)
    );
    return found ? found.type.toLowerCase() : null;
  }, [plan.reactionUsers, me?.id]);

  const handleReact = (type) => sendReact(plan.id, type, me);
  const handleShare = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}/plans/${plan.id}`
    );
    alert("Đã sao chép liên kết!");
  };

  return (
    <article
      className="
        bg-white/95 dark:bg-gray-900/90
        rounded-2xl border border-gray-100 dark:border-gray-800
        shadow-lg shadow-gray-200/60 dark:shadow-black/40
        p-4 sm:p-5
        transition-transform duration-200
         hover:shadow-xl
      "
    >
      <PlanHeader
        author={plan.author}
        createdAt={plan.createdAt}
        visibility={plan.visibility}
        views={plan.views || 0}
      />

      <h3
        onClick={onOpenDetail}
        className="
          mt-3 text-lg sm:text-xl font-semibold
          text-gray-900 dark:text-gray-50
          hover:text-sky-600 dark:hover:text-sky-400
          cursor-pointer line-clamp-2
        "
      >
        {plan.title}
      </h3>

      <div
        className="
          mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400
          flex flex-wrap items-center gap-3
        "
      >
        <span className="flex items-center gap-1.5">
          <CalendarDaysIcon className="w-4 h-4" />
          {plan.startDate} – {plan.endDate} • {plan.days} ngày
        </span>
        <span className="flex items-center gap-1.5">
          <MapPinIcon className="w-4 h-4" />
          {plan.destinations?.length || 0} điểm đến
        </span>
      </div>

      {!!plan.description && (
        <p className="mt-2 mb-2 text-sm text-gray-700 dark:text-gray-200">
          {desc.short}
          {desc.truncated && (
            <button
              type="button"
              onClick={onOpenDetail}
              className="ml-1 text-sky-600 dark:text-sky-400 hover:underline text-xs font-medium"
            >
              Xem thêm
            </button>
          )}
        </p>
      )}

      <PlanMedia images={plan.images} />

      <div className="mt-3">
        <PlanActions
          reactions={plan.reactions}
          reactionUsers={plan.reactionUsers}
          myReaction={myReaction}
          onReact={handleReact}
          onCommentFocus={() => commentRef.current?.focus()}
          onShare={handleShare}
        />
      </div>

      <PlanComments
        me={me}
        planId={plan.id}
        comments={plan.comments}
        inputRef={commentRef}
      />
    </article>
  );
}
