import { useRef, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { MapPinIcon, CalendarDaysIcon, BanknotesIcon } from "@heroicons/react/24/outline";

import PlanHeader from "./PlanHeader";
import PlanMedia from "./PlanMedia";
import PlanActions from "./PlanActions";
import PlanComments from "./PlanComments";

import { usePlans } from "../hooks/usePlans";
import { truncate } from "../utils/utils";
import { showSuccess } from "../../../utils/toastUtils";

export default function PlanPostCard({ plan, me, onOpenDetail }) {
  const { t } = useTranslation();
  const { sendReact } = usePlans();
  const commentRef = useRef(null);
  const [showDestPopup, setShowDestPopup] = useState(false);

  const desc = truncate(plan.description || "", 200);

  const budgetStr = useMemo(() => {
    const n = Number(plan.budgetTotal);
    if (!plan.budgetTotal || isNaN(n) || n <= 0) return null;
    const currency = plan.budgetCurrency || "VND";
    let formatted;
    if (n >= 1_000_000_000) formatted = `${(n / 1_000_000_000).toFixed(1)}B`;
    else if (n >= 1_000_000) formatted = `${Math.round(n / 1_000_000)}tr`;
    else if (n >= 1_000) formatted = `${Math.round(n / 1_000)}k`;
    else formatted = String(n);
    return currency === "VND" ? formatted : `${formatted} ${currency}`;
  }, [plan.budgetTotal, plan.budgetCurrency]);

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
    showSuccess(t("feed.share_copied"));
  };

  // === Destinations ===
  const destinationNames = useMemo(
    () =>
      (plan.destinations || [])
        .map((d) => d?.name?.trim())
        .filter(Boolean),
    [plan.destinations]
  );


  const hasDestinations = destinationNames.length > 0;

  return (
    <article
      className="
        bg-white/95 dark:bg-gray-900/90
        rounded-2xl border border-gray-100 dark:border-gray-800
        shadow-md hover:shadow-lg dark:shadow-black/30
        p-5 sm:p-6
        transition-all duration-300
        hover:border-gray-200 dark:hover:border-gray-700
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
          mt-4 text-lg sm:text-xl font-bold
          text-gray-900 dark:text-gray-50
          hover:text-sky-600 dark:hover:text-sky-400
          cursor-pointer line-clamp-2
          transition-colors duration-150
        "
      >
        {plan.title}
      </h3>

      <div
        className="
          mt-2.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400
          flex flex-wrap items-center gap-4
        "
      >
        {/* Ngày đi */}
        <span className="flex items-center gap-1.5 font-medium">
          <CalendarDaysIcon className="w-4 h-4 text-sky-500" />
          <span className="text-gray-700 dark:text-gray-300">{plan.startDate} – {plan.endDate}</span>
          <span className="text-gray-500 dark:text-gray-400">({t("feed.daysCount", { n: plan.days })})</span>
        </span>

        {/* Ngân sách */}
        {budgetStr && (
          <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
            <BanknotesIcon className="w-4 h-4" />
            {budgetStr}
          </span>
        )}

        {/* Điểm đến + popup */}
        <div className="relative">
          <button
            type="button"
            className="
              flex items-center gap-1.5 font-medium
              px-2.5 py-1 rounded-lg
              hover:bg-sky-50 dark:hover:bg-sky-900/30
              text-gray-700 dark:text-gray-300
              hover:text-sky-600 dark:hover:text-sky-400
              transition-all duration-150
            "
            onMouseEnter={() => setShowDestPopup(true)}
            onMouseLeave={() => setShowDestPopup(false)}
            onClick={() => setShowDestPopup((v) => !v)}
          >
            <MapPinIcon className="w-4 h-4 text-sky-500" />
            <span className="truncate max-w-[180px] sm:max-w-[220px]">
              {t("feed.destinationsCount", { n: plan.destinations?.length || 0 })}
            </span>
          </button>

          {showDestPopup && hasDestinations && (
            <div
              className="
                absolute z-30 mt-2 left-0
                w-56 sm:w-64
                rounded-xl border border-gray-200 dark:border-gray-700
                bg-white dark:bg-gray-900
                shadow-lg dark:shadow-black/50
                p-3 backdrop-blur-sm
              "
              onMouseEnter={() => setShowDestPopup(true)}
              onMouseLeave={() => setShowDestPopup(false)}
            >
              <div className="px-1 pb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                📍 {t("feed.destinations.title")}
              </div>
              <ul className="max-h-56 overflow-y-auto text-xs text-gray-700 dark:text-gray-200 space-y-1">
                {destinationNames.map((name, idx) => (
                  <li
                    key={`${name}-${idx}`}
                    className="flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-sky-50 dark:hover:bg-sky-900/40 transition-colors"
                  >
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                    <span className="leading-snug">{name}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {!!plan.description && (
        <p className="mt-3 mb-3 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
          {desc.short}
          {desc.truncated && (
            <button
              type="button"
              onClick={onOpenDetail}
              className="ml-1.5 text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 underline text-xs font-semibold transition-colors"
            >
              {t("feed.readMore")}
            </button>
          )}
        </p>
      )}

      <PlanMedia images={plan.images} videos={plan.videos} />

      <div className="mt-4">
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
