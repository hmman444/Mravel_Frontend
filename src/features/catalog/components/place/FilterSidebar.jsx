import { useState } from "react";

const PRICE_LEVEL_LABELS = {
  FREE: "Miễn phí",
  CHEAP: "Bình dân",
  MODERATE: "Tầm trung",
  EXPENSIVE: "Cao cấp",
  LUXURY: "Hạng sang",
};

const EMPTY = { categorySlugs: [], priceLevel: null };

export default function FilterSidebar({ onApply, facets }) {
  const [pending, setPending] = useState(EMPTY);

  const toggleCategory = (value) =>
    setPending((f) => {
      const cur = new Set(f.categorySlugs);
      cur.has(value) ? cur.delete(value) : cur.add(value);
      return { ...f, categorySlugs: [...cur] };
    });

  const togglePriceLevel = (value) =>
    setPending((f) => ({
      ...f,
      priceLevel: f.priceLevel === value ? null : value,
    }));

  const reset = () => setPending(EMPTY);

  const hasAnyFacets =
    facets?.categories?.length > 0 || facets?.priceLevels?.length > 0;

  return (
    <aside className="hidden lg:block lg:col-span-3">
      <div className="sticky top-24 z-10 space-y-4">

        {/* Categories — dynamic from ES */}
        {facets?.categories?.length > 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 p-4">
            <div className="font-semibold mb-2">Danh mục</div>
            {facets.categories.map(({ slug, name, count }) => (
              <label
                key={slug}
                className="flex items-center gap-2 text-sm py-1 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={pending.categorySlugs.includes(slug)}
                  onChange={() => toggleCategory(slug)}
                />
                <span className="flex-1">{name || slug}</span>
                <span className="text-gray-400 text-xs">({count})</span>
              </label>
            ))}
          </div>
        )}

        {/* Price levels — dynamic from ES, radio single-select */}
        {facets?.priceLevels?.length > 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 p-4">
            <div className="font-semibold mb-2">Mức giá</div>
            {facets.priceLevels.map(({ slug, count }) => (
              <label
                key={slug}
                className="flex items-center gap-2 text-sm py-1 cursor-pointer"
              >
                <input
                  type="radio"
                  name="priceLevel"
                  checked={pending.priceLevel === slug}
                  onChange={() => togglePriceLevel(slug)}
                />
                <span className="flex-1">{PRICE_LEVEL_LABELS[slug] || slug}</span>
                <span className="text-gray-400 text-xs">({count})</span>
              </label>
            ))}
          </div>
        )}

        {/* Skeleton while first load */}
        {!hasAnyFacets && facets === null && (
          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 p-4 space-y-2 animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        )}

        {/* No facets available — after load */}
        {!hasAnyFacets && facets !== null && (
          <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Không có bộ lọc khả dụng cho điểm đến này.
            </p>
          </div>
        )}

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
