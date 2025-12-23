// src/features/planBoard/components/stats/components/MembersPanel.jsx
"use client";

function clampInt(x, a, b) {
  const n = Math.round(Number(x));
  if (!Number.isFinite(n)) return a;
  return Math.max(a, Math.min(b, n));
}

function calcPct(a, b) {
  const aa = Number(a) || 0;
  const bb = Math.max(Number(b) || 0, 1);
  return clampInt(Math.round((aa / bb) * 100), 0, 100);
}

export default function MembersPanel({
  members,
  totalActivities,
  fmtMoney,
  labelRole,
}) {
  if (!members?.length) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Chưa có dữ liệu thành viên.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {members.map((m) => {
        const pct = calcPct(m.activityCount || 0, totalActivities);
        return (
          <div
            key={m.userId || m.id || `${m.fullname}-${m.email || "x"}`}
            className="rounded-2xl border border-slate-200/70 bg-slate-50/60 p-3 dark:border-slate-800/70 dark:bg-slate-800/30"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={
                    m.avatar ||
                    "https://static.vecteezy.com/system/resources/thumbnails/009/734/564/small/default-avatar-profile-icon-of-social-media-user-vector.jpg"
                  }
                  alt={m.fullname || "User"}
                  className="h-9 w-9 rounded-2xl object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                    {m.fullname || "Thành viên"}
                  </p>
                  <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                    {labelRole(m.role)} • {m.activityCount || 0} hoạt động
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {fmtMoney(m.shareActual ?? 0)}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Phần chi của bạn
                </p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full ${
                    pct >= 60
                      ? "bg-emerald-500/80"
                      : pct >= 30
                      ? "bg-amber-500/80"
                      : "bg-slate-400/80"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                {pct}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
