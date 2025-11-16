import { LayoutList, LayoutGrid } from "lucide-react";

export default function ControlBar({ title, count, sortBy, setSortBy, view, setView }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 p-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="min-w-0">
        <div className="text-lg font-semibold truncate">{title}</div>
        <div className="text-sm text-gray-500">{count} địa điểm được tìm thấy</div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Xếp theo:</span>
          <select className="rounded border px-2 py-1 bg-transparent" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="popular">Độ phổ biến</option>
            <option value="name_asc">Tên A → Z</option>
            <option value="name_desc">Tên Z → A</option>
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            className={`px-2 py-2 rounded-lg border ${view === "list" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
            onClick={() => setView("list")}
            aria-label="List view"
          >
            <LayoutList className="w-5 h-5" />
          </button>
          <button
            className={`px-2 py-2 rounded-lg border ${view === "grid" ? "bg-gray-100 dark:bg-gray-800" : ""}`}
            onClick={() => setView("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}