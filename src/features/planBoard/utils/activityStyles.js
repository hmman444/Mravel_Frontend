// activityStyles.js
export const inputBase =
  "bg-white/90 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700 rounded-xl shadow-[0_1px_3px_rgba(15,23,42,0.08)] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition";

export const pillBtn =
  "px-3 py-1.5 rounded-full text-xs font-medium border shadow-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed";

export const sectionCard =
  "rounded-2xl bg-white/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 p-3.5 sm:p-4";

export const TYPE_STYLES = {
  TRANSPORT: {
    bg: "bg-sky-50",
    border: "border-sky-100",
    accent: "text-sky-600",
    pillBg: "bg-sky-100",
    pillText: "text-sky-800",
    icon: "🚕",
    label: "Di chuyển",
  },
  FOOD: {
    bg: "bg-orange-50",
    border: "border-orange-100",
    accent: "text-orange-600",
    pillBg: "bg-orange-100",
    pillText: "text-orange-800",
    icon: "🥘",
    label: "Ăn uống",
  },
  STAY: {
    bg: "bg-violet-50",
    border: "border-violet-100",
    accent: "text-violet-600",
    pillBg: "bg-violet-100",
    pillText: "text-violet-800",
    icon: "🛏️",
    label: "Nghỉ ngơi",
  },
  ENTERTAIN: {
    bg: "bg-emerald-50",
    border: "border-emerald-100",
    accent: "text-emerald-600",
    pillBg: "bg-emerald-100",
    pillText: "text-emerald-800",
    icon: "🎡",
    label: "Vui chơi",
  },
  SIGHTSEEING: {
    bg: "bg-amber-50",
    border: "border-amber-100",
    accent: "text-amber-600",
    pillBg: "bg-amber-100",
    pillText: "text-amber-800",
    icon: "🏛️",
    label: "Tham quan",
  },
  SHOPPING: {
    bg: "bg-pink-50",
    border: "border-pink-100",
    accent: "text-pink-600",
    pillBg: "bg-pink-100",
    pillText: "text-pink-800",
    icon: "🛍️",
    label: "Mua sắm",
  },
  CINEMA: {
    bg: "bg-rose-50",
    border: "border-rose-100",
    accent: "text-rose-600",
    pillBg: "bg-rose-100",
    pillText: "text-rose-800",
    icon: "🎬",
    label: "Xem phim",
  },
  EVENT: {
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    accent: "text-indigo-600",
    pillBg: "bg-indigo-100",
    pillText: "text-indigo-800",
    icon: "🎤",
    label: "Sự kiện",
  },
  OTHER: {
    bg: "bg-slate-50",
    border: "border-slate-100",
    accent: "text-slate-600",
    pillBg: "bg-slate-100",
    pillText: "text-slate-800",
    icon: "📝",
    label: "Hoạt động",
  },
};
