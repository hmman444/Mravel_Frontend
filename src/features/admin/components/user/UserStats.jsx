"use client";

// src/features/admin/components/user/UserStats.jsx
function MiniStat({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{value}</div>
    </div>
  );
}

export default function UserStats({ totalCount, activeCount, lockedCount, visibleCount }) {
  return (
    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-4">
      <MiniStat label="Tổng tài khoản" value={totalCount} />
      <MiniStat label="Hoạt động" value={activeCount} />
      <MiniStat label="Bị khóa" value={lockedCount} />
      <MiniStat label="Đang hiển thị (theo lọc)" value={visibleCount} />
    </div>
  );
}
