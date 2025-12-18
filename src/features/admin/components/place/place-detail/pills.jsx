import { ui } from "./uiTokens";

export function Label({ children, required }) {
  return (
    <div className={ui.label}>
      {children} {required && <span className="text-rose-600">*</span>}
    </div>
  );
}

export function KindPill({ kind }) {
  const cls =
    kind === "DESTINATION"
      ? "bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/30 dark:text-sky-200 dark:border-sky-900"
      : kind === "POI"
      ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900"
      : "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/30 dark:text-violet-200 dark:border-violet-900";

  const label = kind === "DESTINATION" ? "Điểm đến" : "Địa điểm";
  return <span className={`${ui.pill} ${cls}`}>{label}</span>;
}

export function StatusPill({ active }) {
  const cls = active
    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900"
    : "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-900 dark:text-slate-200 dark:border-slate-800";
  return <span className={`${ui.pill} ${cls}`}>{active ? "Đang hoạt động" : "Đã khóa"}</span>;
}
