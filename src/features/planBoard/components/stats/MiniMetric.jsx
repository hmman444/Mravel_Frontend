// src/features/planBoard/components/stats/components/MiniMetric.jsx
"use client";

function clampInt(x, a, b) {
  const n = Math.round(Number(x));
  if (!Number.isFinite(n)) return a;
  return Math.max(a, Math.min(b, n));
}

export default function MiniMetric({ label, value }) {
  const pct = clampInt(value, 0, 100);
  const color =
    pct >= 70
      ? "bg-emerald-500/80"
      : pct >= 40
      ? "bg-amber-500/80"
      : "bg-slate-400/80";

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {label}
        </p>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
          {pct}%
        </p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
