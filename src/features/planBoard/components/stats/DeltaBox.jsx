// src/features/planBoard/components/stats/components/DeltaBox.jsx
"use client";

import { TrendingDown, TrendingUp } from "lucide-react";

export default function DeltaBox({ label, delta, fmtSignedMoney }) {
  const isUp = delta > 0;
  const isDown = delta < 0;

  const cls = isUp
    ? "border-rose-200/70 bg-rose-50/60 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-100"
    : isDown
    ? "border-emerald-200/70 bg-emerald-50/60 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100"
    : "border-slate-200/70 bg-slate-50/60 text-slate-700 dark:border-slate-800/70 dark:bg-slate-800/30 dark:text-slate-200";

  return (
    <div className={`rounded-2xl border p-3 ${cls}`}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold">{label}</p>
        <div className="flex items-center gap-2">
          {isUp && <TrendingUp className="h-4 w-4" />}
          {isDown && <TrendingDown className="h-4 w-4" />}
          <p className="text-sm font-semibold">{fmtSignedMoney(delta)}</p>
        </div>
      </div>
    </div>
  );
}
