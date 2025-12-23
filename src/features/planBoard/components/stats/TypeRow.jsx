// src/features/planBoard/components/stats/components/TypeRow.jsx
"use client";

function clampInt(x, a, b) {
  const n = Math.round(Number(x));
  if (!Number.isFinite(n)) return a;
  return Math.max(a, Math.min(b, n));
}

export default function TypeRow({
  type,
  estimated,
  actual,
  fmtMoney,
  fmtSignedMoney,
  labelActivityType,
  typeEmoji,
  max,
}) {
  const pct = max > 0 ? Math.round((actual / max) * 100) : 0;
  const barColor = actual > estimated ? "bg-rose-500/80" : "bg-emerald-500/80";
  const delta = actual - estimated;

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-slate-50/60 px-3 py-2 dark:border-slate-800/70 dark:bg-slate-800/30">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
            {typeEmoji(type)}
          </span>
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">
              {labelActivityType(type)}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Dự toán {fmtMoney(estimated)} • Thực chi{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">
                {fmtMoney(actual)}
              </span>
            </p>
          </div>
        </div>

        <p
          className={`text-xs font-semibold ${
            delta > 0
              ? "text-rose-700 dark:text-rose-200"
              : delta < 0
              ? "text-emerald-700 dark:text-emerald-200"
              : "text-slate-600 dark:text-slate-300"
          }`}
        >
          {fmtSignedMoney(delta)}
        </p>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${clampInt(pct, 0, 100)}%` }}
        />
      </div>
    </div>
  );
}
