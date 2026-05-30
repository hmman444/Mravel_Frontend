"use client";

import { useTranslation } from "react-i18next";

// src/features/admin/components/user/UserStats.jsx
function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white dark:bg-gray-800 px-4 py-3 shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

export default function UserStats({ totalCount, activeCount, lockedCount, visibleCount }) {
  const { t } = useTranslation();
  return (
    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
      <MiniStat label={t("admin.user_stats_total_accounts")} value={totalCount} />
      <MiniStat label={t("admin.user_stats_active")} value={activeCount} />
      <MiniStat label={t("admin.user_stats_locked")} value={lockedCount} />
      <MiniStat label={t("admin.user_stats_visible_filtered")} value={visibleCount} />
    </div>
  );
}
