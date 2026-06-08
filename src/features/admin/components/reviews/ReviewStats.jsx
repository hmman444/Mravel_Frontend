"use client";

import { useTranslation } from "react-i18next";

function MiniStat({ label, value, tone = "default" }) {
  const toneCls =
    tone === "danger"
      ? "text-rose-600 dark:text-rose-400"
      : "text-slate-900 dark:text-white";
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="text-xs text-slate-500">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${toneCls}`}>{value}</div>
    </div>
  );
}

export default function ReviewStats({ negativeCount, visibleCount, maxRating }) {
  const { t } = useTranslation();
  return (
    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <MiniStat
        label={t("admin.review_stats_negative_total")}
        value={negativeCount}
        tone="danger"
      />
      <MiniStat label={t("admin.review_stats_visible")} value={visibleCount} />
      <MiniStat
        label={t("admin.review_stats_threshold")}
        value={`≤ ${maxRating} ★`}
      />
    </div>
  );
}
