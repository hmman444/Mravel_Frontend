import { useState } from "react";

/* Sidebar giữ state cục bộ (pendingFilters).
   Bấm Áp dụng => gọi onApply(pendingFilters) lên trang cha. */
export default function FilterSidebar({ onApply }) {
  const [pending, setPending] = useState({ types: [], popular: {} });

  const toggleIn = (k, val) =>
    setPending((f) => {
      const cur = new Set(f[k] || []);
      cur.has(val) ? cur.delete(val) : cur.add(val);
      return { ...f, [k]: [...cur] };
    });

  const reset = () => setPending({ types: [], popular: {} });

  return (
    <aside className="hidden lg:block lg:col-span-3">
      <div className="sticky top-24 z-10 space-y-4">
        {/* Lọc phổ biến */}
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 p-4">
          <div className="font-semibold mb-2">Lọc phổ biến</div>
          {[
            ["family", "Phù hợp gia đình"],
            ["convenient", "Vị trí thuận tiện"],
            ["photospot", "Điểm sống ảo"],
          ].map(([k, label]) => (
            <label key={k} className="flex items-center gap-2 text-sm py-1">
              <input
                type="checkbox"
                checked={!!pending.popular?.[k]}
                onChange={() =>
                  setPending((f) => ({ ...f, popular: { ...f.popular, [k]: !f.popular?.[k] } }))
                }
              />
              {label}
            </label>
          ))}
        </div>

        {/* Loại điểm tham quan (ví dụ) */}
        <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 p-4">
          <div className="font-semibold mb-2">Loại điểm tham quan</div>
          {["Danh lam", "Bảo tàng", "Mua sắm", "Công viên"].map((t) => (
            <label key={t} className="flex items-center gap-2 text-sm py-1">
              <input
                type="checkbox"
                checked={pending.types?.includes(t)}
                onChange={() => toggleIn("types", t)}
              />
              {t}
            </label>
          ))}
        </div>

        <div className="flex gap-2">
        <button
          onClick={reset}
          className="
            flex-1 py-2 rounded-lg text-sm font-medium
            border border-slate-300 dark:border-white/20
            text-slate-700 dark:text-gray-100
            bg-white/30 dark:bg-white/5
            backdrop-blur-md
            hover:bg-white/60 dark:hover:bg-white/10
            transition-all duration-200
          "
        >
          Đặt lại
        </button>

        <button
          onClick={() => onApply(pending)}
          className="
            flex-1 py-2 rounded-lg text-sm font-semibold text-white
            bg-gradient-to-r from-sky-500 to-blue-600
            hover:-translate-y-0.5 active:translate-y-0
            shadow-sm hover:shadow-lg
            transition-all duration-200
          "
        >
          Áp dụng
        </button>
      </div>

      </div>
    </aside>
  );
}