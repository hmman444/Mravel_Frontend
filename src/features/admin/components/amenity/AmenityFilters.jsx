"use client";

// src/features/admin/components/amenity/AmenityFilters.jsx
import { MagnifyingGlassIcon, XMarkIcon, ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import {
  SCOPE_OPTIONS,
  GROUP_OPTIONS,
  SECTION_OPTIONS,
  SORT_OPTIONS,
  SCOPE_LABEL,
  GROUP_LABEL,
  SECTION_LABEL,
  labelOf,
} from "./amenityTerms";

const ui = {
  card:
    "rounded-2xl border border-slate-200/70 bg-white shadow-sm " +
    "dark:bg-slate-900 dark:border-slate-800",
  title: "text-xs font-semibold text-slate-700 dark:text-slate-200",
  help: "text-[11px] text-slate-500 dark:text-slate-400",
  input:
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none " +
    "focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 " +
    "dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100",
  select:
    "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none " +
    "focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 " +
    "dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100",
  btn:
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium " +
    "transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
  btnGhost:
    "bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 " +
    "dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900",
  chipWrap:
    "inline-flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 " +
    "dark:border-slate-800 dark:bg-slate-950",
  chip:
    "px-3 py-1.5 rounded-lg text-sm font-medium transition select-none",
  chipOn:
    "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200 " +
    "dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700",
  chipOff:
    "text-slate-600 hover:text-slate-900 hover:bg-white/70 " +
    "dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900/60",
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

export default function AmenityFilters({
  t,
  open,
  search,
  setSearch,
  scope,
  setScope,
  group,
  setGroup,
  section,
  setSection,
  // ✅ NEW: 3-state filter: "ALL" | "ACTIVE" | "INACTIVE"
  activeFilter,
  setActiveFilter,
  sortBy,
  setSortBy,
  hasAnyFilter,
  onReset,
}) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          exit="exit"
          transition={{ duration: 0.2 }}
          className={`${ui.card} mb-6 p-4`}
        >
          <div className="flex flex-col gap-4">
            {/* Row 1: Search + Active filter + Reset */}
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              {/* Search */}
              <div className="w-full lg:max-w-md">
                <div className="flex items-center justify-between">
                  <label className={ui.title}>{t("search_amenity")}</label>
                  <span className={ui.help}>Tên / Code / Mô tả</span>
                </div>

                <div className="relative mt-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Ví dụ: WIFI / PARKING / phòng..."
                    className={`${ui.input} pl-10`}
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch("")}
                      className="absolute right-2 top-2 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-slate-800"
                      aria-label="Clear search"
                    >
                      <XMarkIcon className="h-5 w-5 text-slate-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* Active filter (3-state chips) */}
              <div className="w-full lg:w-auto">
                <div className="flex items-center justify-between">
                  <label className={ui.title}>Trạng thái</label>
                  <span className={ui.help}>Active / Inactive</span>
                </div>

                <div className={`mt-1 ${ui.chipWrap}`}>
                  {[
                    { v: "ALL", label: "Tất cả" },
                    { v: "ACTIVE", label: "Đang bật" },
                    { v: "INACTIVE", label: "Đang tắt" },
                  ].map((x) => {
                    const on = activeFilter === x.v;
                    return (
                      <button
                        key={x.v}
                        type="button"
                        onClick={() => setActiveFilter(x.v)}
                        className={`${ui.chip} ${on ? ui.chipOn : ui.chipOff}`}
                        aria-pressed={on}
                      >
                        {x.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reset */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onReset}
                  className={`${ui.btn} ${ui.btnGhost}`}
                  disabled={!hasAnyFilter}
                  title="Reset bộ lọc"
                >
                  Reset
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-200/70 dark:bg-slate-800" />

            {/* Row 2: Selects */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className={ui.title}>Scope</label>
                <select value={scope} onChange={(e) => setScope(e.target.value)} className={`${ui.select} mt-1`}>
                  {SCOPE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {labelOf(SCOPE_LABEL, s)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={ui.title}>Group</label>
                <select value={group} onChange={(e) => setGroup(e.target.value)} className={`${ui.select} mt-1`}>
                  {GROUP_OPTIONS.map((g) => (
                    <option key={g} value={g}>
                      {labelOf(GROUP_LABEL, g)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={ui.title}>Section</label>
                <select value={section} onChange={(e) => setSection(e.target.value)} className={`${ui.select} mt-1`}>
                  {SECTION_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {labelOf(SECTION_LABEL, s)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className={ui.title}>Sắp xếp</label>
                <div className="relative mt-1">
                  <ArrowsUpDownIcon className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`${ui.select} pl-10`}
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
