import { useRef, useMemo, useState } from "react";
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
  const [showDestPopup, setShowDestPopup] = useState(false);

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

  // === Destinations ===
  const destinationNames = useMemo(
    () =>
      (plan.destinations || [])
        .map((d) => d?.name?.trim())
        .filter(Boolean),
    [plan.destinations]
  );

  const destinationSummary = useMemo(() => {
    if (!destinationNames.length) return "Chưa chọn điểm đến";
    if (destinationNames.length <= 2) return destinationNames.join(", ");
    return `${destinationNames.slice(0, 2).join(", ")} +${
      destinationNames.length - 2
    }`;
  }, [destinationNames]);

  const hasDestinations = destinationNames.length > 0;

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
        {/* Ngày đi */}
        <span className="flex items-center gap-1.5">
          <CalendarDaysIcon className="w-4 h-4" />
          {plan.startDate} – {plan.endDate} • {plan.days} ngày
        </span>

        {/* Điểm đến + popup */}
        <div className="relative">
          <button
            type="button"
            className="
              flex items-center gap-1.5
              px-2 py-1 rounded-full
              hover:bg-sky-50 dark:hover:bg-sky-900/40
              transition-colors
            "
            onMouseEnter={() => setShowDestPopup(true)}
            onMouseLeave={() => setShowDestPopup(false)}
            onClick={() => setShowDestPopup((v) => !v)}
          >
            <MapPinIcon className="w-4 h-4" />
            <span className="truncate max-w-[180px] sm:max-w-[220px]">
              {plan.destinations?.length || 0} điểm đến
            </span>
          </button>

          {showDestPopup && hasDestinations && (
            <div
              className="
                absolute z-30 mt-1 left-0
                w-56 sm:w-64
                rounded-xl border border-gray-200 dark:border-gray-700
                bg-white dark:bg-gray-900
                shadow-xl shadow-gray-300/60 dark:shadow-black/60
                p-2
              "
              onMouseEnter={() => setShowDestPopup(true)}
              onMouseLeave={() => setShowDestPopup(false)}
            >
              <div className="px-1 pb-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Điểm đến trong kế hoạch
              </div>
              <ul className="max-h-56 overflow-y-auto text-xs text-gray-700 dark:text-gray-200">
                {destinationNames.map((name, idx) => (
                  <li
                    key={`${name}-${idx}`}
                    className="flex items-start gap-2 px-1 py-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/40"
                  >
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-sky-500" />
                    <span className="leading-snug">{name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
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
