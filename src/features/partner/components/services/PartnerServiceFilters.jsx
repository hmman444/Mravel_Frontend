"use client";

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
  select:
    "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm outline-none " +
    "focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400 " +
    "dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100",
  btn:
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium " +
    "transition active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
  btnGhost:
    "bg-white dark:bg-gray-800 hover:bg-slate-50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 " +
    "dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900",
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

export default function PartnerServiceFilters({
  open,
  search,
  setSearch,
  status,
  setStatus,
  hasAnyFilter,
  onReset,
}) {
  const { t } = useTranslation();

  const STATUS_OPTIONS = [
    { value: "all", label: t("common.all") },
    { value: "PENDING", label: t("partner.service.status.pending") },
    { value: "ACTIVE", label: t("partner.service.status.active") },
    { value: "REJECTED", label: t("partner.service.status.rejected") },
    { value: "PARTNER_PAUSED", label: t("partner.service.status.partner_paused") },
    { value: "ADMIN_BLOCKED", label: t("partner.service.status.admin_blocked") },
  ];

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
              <div className="w-full lg:max-w-md">
                <div className="flex items-center justify-between">
                  <label className={ui.title}>{t("common.search")}</label>
                  <span className={ui.help}>{t("partner.service.search_hint")}</span>
                </div>

                <div className="relative mt-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={t("partner.service.search_placeholder")}
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

              <div className="w-full lg:max-w-xs">
                <div className="flex items-center justify-between">
                  <label className={ui.title}>{t("partner.service.status_label")}</label>
                  <span className={ui.help}>moderation + active</span>
                </div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`${ui.select} mt-1`}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onReset}
                  className={`${ui.btn} ${ui.btnGhost}`}
                  disabled={!hasAnyFilter}
                >
                  {t("partner.service.reset")}
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
