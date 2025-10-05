import { useMemo, useRef, useState } from "react";
import PlanHeader from "./PlanHeader";
import PlanMedia from "./PlanMedia";
import PlanActions from "./PlanActions";
import PlanComments from "./PlanComments";
import { truncate } from "../utils/utils";
import { MapPinIcon, CalendarDaysIcon } from "@heroicons/react/24/outline";

/**
 * plan:
 * {
 *  id, title, description, startDate, endDate, days, visibility, views,
 *  author: { id, name, avatar }, createdAt,
 *  images: [url],
 *  destinations: [{name, lat, lng}],
 *  reactions: { like:1, love:0, ... },
 *  comments: [{ id, user:{id,name,avatar}, text, createdAt }]
 * }
 */
export default function PlanPostCard({ plan, me, onOpenDetail }) {
  const [reactions, setReactions] = useState(plan.reactions || {});
  const [comments, setComments] = useState(plan.comments || []);
  const [expanded, setExpanded] = useState(false);
  const commentInputFocusRef = useRef(null);

  //const sumReactions = useMemo(() => Object.values(reactions).reduce((a,b)=>a+b,0), [reactions]);
  const desc = useMemo(() => truncate(plan.description || "", 200), [plan.description]);

  const react = (key) => {
    setReactions((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
  };

  const addComment = (c) => setComments((prev) => [...prev, c]);
  const deleteComment = (id) => setComments((prev) => prev.filter(x => x.id !== id));

  const share = () => {
    const url = `${window.location.origin}/plans/${plan.id}`;
    navigator.clipboard.writeText(url);
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

      {/* Meta (time range, days, destinations count) */}
      <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-3 mb-2">
        <span className="flex items-center gap-1">
          <CalendarDaysIcon className="w-4 h-4" />
          {plan.startDate} – {plan.endDate} • {plan.days} ngày
        </span>
        <span className="flex items-center gap-1">
          <MapPinIcon className="w-4 h-4" />
          {plan.destinations?.length || 0} điểm đến
        </span>
      </div>

      {/* Description (collapse) */}
      {!!plan.description && (
        <div className="mb-3 text-sm">
          {!expanded ? (
            <>
              {desc.short}{" "}
              {desc.truncated && (
                <button className="text-primary hover:underline" onClick={() => setExpanded(true)}>
                  Xem thêm
                </button>
              )}
            </>
          ) : (
            <>
              {plan.description}{" "}
              <button className="text-primary hover:underline" onClick={() => setExpanded(false)}>
                Thu gọn
              </button>
            </>
          )}
        </div>
      )}

      {/* Album */}
      <PlanMedia images={plan.images} />

      {/* Actions */}
      <div className="mt-3">
        <PlanActions
          reactions={reactions}
          onReact={react}
          onCommentFocus={() => commentInputFocusRef.current?.focus()}
          onShare={share}
        />
      </div>

      {/* Comments */}
      <PlanComments
        me={me}
        comments={comments}
        onAdd={addComment}
        onDelete={deleteComment}
      />
    </article>
  );
}
