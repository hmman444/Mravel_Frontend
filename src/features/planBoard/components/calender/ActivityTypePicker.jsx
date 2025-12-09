// src/features/planBoard/components/ActivityTypePicker.jsx
"use client";

export default function ActivityTypePicker({
  creatingSlot,
  onClose,
  onOpenCreate,
}) {
  if (!creatingSlot) return null;

  const { dateStr, hour } = creatingSlot;

  const btn = (type, label, extraClass = "") => (
    <button
      key={type}
      className={extraClass}
      onClick={() => onOpenCreate(dateStr, hour, type)}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed left-1/2 bottom-6 z-[998] -translate-x-1/2">
      <div className="rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-700/80 px-4 py-3 flex flex-col gap-2">
        <div className="flex justify-between items-center gap-4">
          <div className="text-xs text-slate-600 dark:text-slate-300">
            <div className="font-semibold mb-0.5">Tạo hoạt động mới</div>
            <div className="text-[11px] text-slate-500">
              Ngày {dateStr}, khoảng {hour}:00
            </div>
          </div>
          <button
            className="text-[11px] text-slate-400 hover:text-slate-700"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>

        <div className="grid grid-cols-5 gap-2 text-[10px]">
          {btn(
            "TRANSPORT",
            "🚕 Di chuyển",
            "px-2 py-1.5 rounded-lg border border-sky-200 bg-sky-50 text-sky-700 hover:bg-sky-100 hover:border-sky-300 active:scale-95 transition"
          )}
          {btn(
            "FOOD",
            "🥘 Ăn uống",
            "px-2 py-1.5 rounded-lg border border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100 hover:border-orange-300 active:scale-95 transition"
          )}
          {btn(
            "STAY",
            "🛏️ Lưu trú",
            "px-2 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 active:scale-95 transition"
          )}
          {btn(
            "SIGHTSEEING",
            "🏛️ Tham quan",
            "px-2 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 active:scale-95 transition"
          )}
          {btn(
            "ENTERTAIN",
            "🎡 Giải trí",
            "px-2 py-1.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-300 active:scale-95 transition"
          )}
          {btn(
            "SHOPPING",
            "🛍️ Mua sắm",
            "px-2 py-1.5 rounded-lg border border-pink-200 bg-pink-50 text-pink-700 hover:bg-pink-100 hover:border-pink-300 active:scale-95 transition"
          )}
          {btn(
            "CINEMA",
            "🎬 Rạp phim",
            "px-2 py-1.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300 active:scale-95 transition"
          )}
          {btn(
            "EVENT",
            "🎫 Sự kiện",
            "px-2 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-300 active:scale-95 transition"
          )}
          {btn(
            "OTHER",
            "✏️ Khác",
            "px-2 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 hover:border-slate-300 active:scale-95 transition col-span-2"
          )}
        </div>
      </div>
    </div>
  );
}
