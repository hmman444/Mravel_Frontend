// src/features/planBoard/components/stats/components/IssuesIconPanel.jsx
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, BadgePercent, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function IssuesIconPanel({
  issues = [],
  open,
  onToggle,
  showAll,
  onToggleShowAll,
  labelActivityType,
  iconWhenEmpty,
  iconWhenHas,
}) {
  const { t } = useTranslation();
  const issuesToShow = showAll ? issues : issues.slice(0, 6);

  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white dark:bg-gray-800 shadow-[0_12px_40px_rgba(2,6,23,0.08)] dark:border-slate-800/70 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3 p-5">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
            {t("plan.stats.issues.heading")}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {t("plan.stats.issues.subheading")}
          </p>
        </div>

        <button
          onClick={onToggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200/70 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:border-slate-800/70 dark:bg-slate-900 dark:hover:bg-slate-800/60 transition"
          title={open ? t("plan.stats.issues.close") : t("plan.stats.issues.open")}
        >
          {issues.length === 0 ? iconWhenEmpty : iconWhenHas}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                  {issues.length === 0 ? t("plan.stats.issues.none") : t("plan.stats.issues.count", { n: issues.length })}
                </p>

                {issues.length > 6 && (
                  <button
                    onClick={onToggleShowAll}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border border-slate-200/70 bg-white dark:bg-gray-800 hover:bg-slate-50 dark:border-slate-800/70 dark:bg-slate-900 dark:hover:bg-slate-800/60 transition"
                  >
                    {showAll ? (
                      <>
                        {t("plan.stats.issues.collapse")} <ChevronUp className="h-4 w-4" />
                      </>
                    ) : (
                      <>
                        {t("plan.stats.issues.show_more")} <ChevronDown className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}
              </div>

              <div className="mt-3 space-y-2">
                {issues.length === 0 ? (
                  <div className="rounded-2xl border border-emerald-200/70 bg-emerald-50/60 p-4 text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-100">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{t("plan.stats.issues.ok_title")}</p>
                        <p className="mt-0.5 text-xs opacity-90">
                          {t("plan.stats.issues.ok_desc")}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  issuesToShow.map((iss, idx) => (
                    <div
                      key={`${iss.code}-${iss.cardTitle}-${iss.activityType}-${idx}`}
                      className={`w-full rounded-2xl border p-3 ${
                        iss.severity === "ERROR"
                          ? "border-rose-200/70 bg-rose-50/60 dark:border-rose-500/30 dark:bg-rose-500/10"
                          : "border-amber-200/70 bg-amber-50/60 dark:border-amber-500/30 dark:bg-amber-500/10"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl ${
                            iss.severity === "ERROR"
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200"
                          }`}
                        >
                          {iss.severity === "ERROR" ? (
                            <AlertTriangle className="h-5 w-5" />
                          ) : (
                            <BadgePercent className="h-5 w-5" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                            {iss.title}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-700 dark:text-slate-200">
                            <span className="font-semibold">{iss.cardTitle}</span>{" "}
                            • {labelActivityType(iss.activityType)}
                            {iss.dayDate ? ` • ${iss.dayDate}` : ""}
                          </p>

                          <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                            {iss.message}
                          </p>
                        </div>

                        <span className="shrink-0 text-[11px] font-semibold">
                          {iss.severity === "ERROR" ? t("plan.stats.issues.severity_error") : t("plan.stats.issues.severity_warning")}
                        </span>
                      </div>
                    </div>
                  ))
                )}

                {issues.length > 0 && !showAll && issues.length > 6 && (
                  <p className="pt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    {t("plan.stats.issues.showing", { n: issues.length })}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
