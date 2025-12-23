// src/features/planBoard/components/stats/components/KpiRow.jsx
"use client";

export default function KpiRow({ label, value, hint, strong }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          {label}
        </p>
        {hint && (
          <p className="mt-0.5 text-[11px] text-slate-500 dark:text-slate-400">
            {hint}
          </p>
        )}
      </div>
      <p
        className={`shrink-0 text-sm font-semibold ${
          strong
            ? "text-slate-900 dark:text-slate-100"
            : "text-slate-700 dark:text-slate-200"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
