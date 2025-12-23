// src/features/planBoard/components/stats/components/TopSpendTable.jsx
"use client";

export default function TopSpendTable({
  items,
  fmtMoney,
  labelActivityType,
  typeEmoji,
}) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200/70 dark:border-slate-800/70">
      <div className="grid grid-cols-12">
        <div className="col-span-7 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40">
          Hoạt động
        </div>
        <div className="col-span-3 px-3 py-2 text-center mr-12 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40">
          Ngày
        </div>
        <div className="col-span-2 px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 bg-slate-50/70 dark:bg-slate-800/40">
          Thực chi
        </div>
      </div>

      {items?.length ? (
        items.map((it, idx) => (
          <div
            key={`${it.cardTitle}-${it.dayDate}-${it.activityType}-${it.actualTotal}-${idx}`}
            className="grid grid-cols-12 hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
          >
            <div className="col-span-7 px-3 py-2 text-sm text-slate-700 dark:text-slate-200 border-t border-slate-200/70 dark:border-slate-800/70">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                  {typeEmoji(it.activityType)}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {it.cardTitle}
                  </p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {labelActivityType(it.activityType)}
                    {it.issueBadge ? ` • ${it.issueBadge}` : ""}
                  </p>
                </div>
              </div>
            </div>

            <div className="col-span-3  px-3 py-2 text-[14px] text-slate-700 dark:text-slate-200 border-t border-slate-200/70 dark:border-slate-800/70">
              {it.dayDate || "-"}
            </div>

            <div className="col-span-2 px-3 py-2 text-right text-[12px] font-semibold text-slate-700 dark:text-slate-200 border-t border-slate-200/70 dark:border-slate-800/70">
              {fmtMoney(it.actualTotal)}
            </div>
          </div>
        ))
      ) : (
        <div className="px-3 py-4 text-sm text-slate-500 dark:text-slate-400">
          Chưa có hoạt động nào ghi nhận chi phí.
        </div>
      )}
    </div>
  );
}
