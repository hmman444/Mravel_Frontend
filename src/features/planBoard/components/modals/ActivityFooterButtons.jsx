// src/features/planBoard/components/ActivityFooterButtons.jsx
"use client";

/**
 * Footer bên phải:
 * - Nút Hủy (màu trung tính, dùng chung)
 * - Nút Lưu (màu truyền vào qua submitClassName)
 */
export default function ActivityFooterButtons({
  onCancel,
  onSubmit,
  submitLabel,
  submitClassName, // ví dụ: "bg-gradient-to-r from-orange-500 to-amber-500 shadow-lg shadow-orange-500/30"
}) {
  const baseSubmit =
    "px-4 sm:px-5 py-2 rounded-xl text-white text-xs sm:text-sm font-semibold " +
    "hover:shadow-xl hover:brightness-105 active:scale-[0.98] transition";

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 rounded-xl text-xs sm:text-sm font-medium 
        border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 text-slate-600
        dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
      >
        Hủy
      </button>
      <button
        type="button"
        onClick={onSubmit}
        className={`${baseSubmit} ${submitClassName}`}
      >
        {submitLabel}
      </button>
    </div>
  );
}
