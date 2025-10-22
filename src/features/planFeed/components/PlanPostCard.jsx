import { useRef, useMemo } from "react";
import PlanHeader from "./PlanHeader";
import PlanMedia from "./PlanMedia";
import PlanActions from "./PlanActions";
import PlanComments from "./PlanComments";
import { MapPinIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";
import { usePlans } from "../hooks/usePlans";
import { truncate } from "../utils/utils";

export default function PlanPostCard({ plan, me, onOpenDetail }) {
  const { sendReact, sendComment } = usePlans();
  const commentRef = useRef(null);
  const desc = truncate(plan.description || "", 200);

  // Xác định reaction hiện tại của user (nếu có)
  const myReaction = useMemo(() => {
    if (!plan.reactionUsers || !me?.id) return null;

    // ép kiểu ID để so sánh chính xác
    const found = plan.reactionUsers.find(
      (u) => Number(u.userId) === Number(me.id)
    );

    return found ? found.type.toLowerCase() : null;
  }, [plan.reactionUsers, me?.id]);

  const handleReact = (type) => sendReact(plan.id, type, me);
  const handleComment = (c) => sendComment(plan.id, c);
  const handleShare = () => {
    navigator.clipboard.writeText(`${window.location.origin}/plans/${plan.id}`);
    alert("Đã sao chép liên kết!");
  };

  return (
    <article className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4">
      {/* Header */}
      <PlanHeader
        author={plan.author}
        createdAt={plan.createdAt}
        visibility={plan.visibility}
        views={plan.views || 0}
      />

      {/* Title */}
      <h3
        onClick={onOpenDetail}
        className="mt-3 text-lg font-semibold hover:underline cursor-pointer"
      >
        {plan.title}
      </h3>

      {/* Meta info */}
      <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-3 mb-2">
        <span className="flex items-center gap-1">
          <CalendarDaysIcon className="w-4 h-4" />
          {plan.startDate} – {plan.endDate} • {plan.days} ngày
        </span>
        <span className="flex items-center gap-1">
          <MapPinIcon className="w-4 h-4" /> {plan.destinations?.length || 0} điểm đến
        </span>
      </div>

      {/* Description */}
      {!!plan.description && (
        <p className="mb-3 text-sm">
          {desc.short}
          {desc.truncated && (
            <button className="text-primary hover:underline">Xem thêm</button>
          )}
        </p>
      )}

      {/* Media */}
      <PlanMedia images={plan.images} />

      {/* Actions */}
      <div className="mt-3">
        <PlanActions
          reactions={plan.reactions}
          reactionUsers={plan.reactionUsers}
          myReaction={myReaction} // 👈 truyền reaction hiện tại
          onReact={handleReact}
          onCommentFocus={() => commentRef.current?.focus()}
          onShare={handleShare}
        />
      </div>

      {/* Comments */}
      <PlanComments
        me={me}
        planId={plan.id}
        comments={plan.comments}
        onAdd={handleComment}
      />
    </article>
  );
}
