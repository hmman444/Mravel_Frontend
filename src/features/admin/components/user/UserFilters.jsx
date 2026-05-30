"use client";

// src/features/admin/components/user/UserFilters.jsx
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const ui = {
  card:
    "rounded-2xl border border-slate-200/70 bg-white dark:bg-gray-800 shadow-sm " +
    "dark:bg-slate-900 dark:border-slate-800",
  title: "text-xs font-semibold text-slate-700 dark:text-slate-200",
  help: "text-[11px] text-slate-500 dark:text-slate-400",
  input:
    "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none " +
    "focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 " +
    "dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100",
  btn:
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium " +
    "transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
  btnGhost:
    "bg-white dark:bg-gray-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 " +
    "dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900",
  chipWrap:
    "inline-flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-gray-900 p-1 " +
    "dark:border-slate-800 dark:bg-slate-950",
  chip: "px-3 py-1.5 rounded-lg text-sm font-medium transition select-none",
  chipOn:
    "bg-white dark:bg-gray-800 text-slate-900 dark:text-slate-100 shadow-sm ring-1 ring-slate-200 " +
    "dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-700",
  chipOff:
    "text-slate-600 dark:text-slate-400 hover:text-slate-900 hover:bg-white/70 " +
    "dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900/60",
};

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 8 } };

export default function UserFilters({
  open,
  search,
  setSearch,
  statusFilter,      // "ALL" | "ACTIVE" | "LOCKED"
  setStatusFilter,
  hasAnyFilter,
  onReset,
}) {
  const { t } = useTranslation();
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
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              {/* Search */}
              <div className="w-full lg:max-w-md">
                <div className="flex items-center justify-between">
                  <label className={ui.title}>{t("common.search")}</label>
                  <span className={ui.help}>{t("admin.user_search_hint")}</span>
                </div>

                <div className="relative mt-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("admin.user_search_placeholder")}
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

              {/* Status chips */}
              <div className="w-full lg:w-auto">
                <div className="flex items-center justify-between">
                  <label className={ui.title}>{t("admin.status")}</label>
                  <span className={ui.help}>Active / Locked</span>
                </div>

                <div className={`mt-1 ${ui.chipWrap}`}>
                  {[
                    { v: "ALL", label: t("common.all") },
                    { v: "ACTIVE", label: t("admin.user_status_active") },
                    { v: "LOCKED", label: t("admin.user_status_locked") },
                  ].map((x) => {
                    const on = statusFilter === x.v;
                    return (
                      <button
                        key={x.v}
                        type="button"
                        onClick={() => setStatusFilter(x.v)}
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
                  title={t("admin.reset_filters")}
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
