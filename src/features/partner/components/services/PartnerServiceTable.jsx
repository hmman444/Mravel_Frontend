"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  PencilIcon,
  TrashIcon,
  LockClosedIcon,
  LockOpenIcon,
  PaperAirplaneIcon,
  CheckCircleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

const statusBadge = (s) => {
  const base = "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1";
  if (s === "ACTIVE") return `${base} bg-emerald-50 text-emerald-700 ring-emerald-200`;
  if (s === "PENDING") return `${base} bg-amber-50 text-amber-800 ring-amber-200`;
  if (s === "REJECTED") return `${base} bg-rose-50 text-rose-700 ring-rose-200`;
  if (s === "PARTNER_PAUSED") return `${base} bg-slate-100 dark:bg-gray-800 text-slate-700 dark:text-slate-300 ring-slate-200`;
  if (s === "ADMIN_BLOCKED") return `${base} bg-black/10 dark:bg-white/10 text-slate-900 dark:text-slate-100 ring-slate-300`;
  return `${base} bg-slate-50 dark:bg-gray-900 text-slate-700 dark:text-slate-300 ring-slate-200`;
};

export default function PartnerServiceTable({
  items,
  acting = false,
  onEdit,
  onPause,
  onResume,
  onRequestUnlock,
  onDelete,
}) {
  const { t } = useTranslation();

  const STATUS_LABELS = {
    ACTIVE: t("partner.service_table.status.active"),
    PENDING: t("partner.service_table.status.pending"),
    REJECTED: t("partner.service_table.status.rejected"),
    PARTNER_PAUSED: t("partner.service_table.status.partner_paused"),
    ADMIN_BLOCKED: t("partner.service_table.status.admin_blocked"),
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-gray-800 shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="max-h-[72vh] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              <th className="px-4 py-3 w-[64px] text-center">#</th>
              <th className="px-4 py-3 w-[420px]">{t("partner.service_table.col_service")}</th>
              <th className="px-4 py-3">{t("partner.service_table.col_status")}</th>
              <th className="px-4 py-3 text-center">Active</th>
              <th className="px-4 py-3 text-right">{t("partner.service_table.col_action")}</th>
            </tr>
          </thead>

          <motion.tbody layout>
            <AnimatePresence initial={false}>
              {items.map((x, idx) => {
                const st = x.status;
                const isActive = st === "ACTIVE";
                const isPaused = st === "PARTNER_PAUSED";
                const isBlocked = st === "ADMIN_BLOCKED";

                return (
                  <motion.tr
                    key={`${x.type}-${x.id}`}
                    layout
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    transition={{ duration: 0.16 }}
                    className="border-t border-slate-100 dark:border-slate-700 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3 text-center align-top">
                      <span className="inline-flex min-w-[28px] justify-center rounded-lg bg-slate-100 dark:bg-gray-800 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-300 dark:bg-slate-800 dark:text-slate-200">
                        {idx + 1}
                      </span>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <div className="flex items-start gap-3 min-w-0">
                        <img
                          src={x.thumbnail}
                          alt={x.name}
                          className="h-14 w-20 flex-shrink-0 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="truncate font-semibold text-slate-900 dark:text-white">
                              {x.name}
                            </span>
                            <span className="inline-flex rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300">
                              {x.subtype || x.type}
                            </span>
                          </div>
                          <div className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                            {x.id}
                          </div>
                          <div className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-400">
                            {x.shortDesc}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 align-top">
                      <span className={statusBadge(st)}>{STATUS_LABELS[st] || st}</span>

                      {st === "REJECTED" && (
                        <div className="mt-1 line-clamp-2 text-xs text-rose-600">
                          {t("partner.service_table.reason_label")} {x.rejectReason || "—"}
                        </div>
                      )}

                      {st === "ADMIN_BLOCKED" && (
                        <div className="mt-1 line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                          {x.blockedReason
                            ? `${t("partner.service_table.reason_label")} ${x.blockedReason}`
                            : t("partner.service_table.need_request_unlock")}
                        </div>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center align-top">
                      {isActive ? (
                        <span className="inline-flex items-center justify-center text-emerald-600">
                          <CheckCircleIcon className="h-6 w-6" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center text-slate-400">
                          <XMarkIcon className="h-6 w-6" />
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right align-top">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onEdit?.(x)}
                          disabled={acting}
                          className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
                          title={t("common.edit")}
                        >
                          <PencilIcon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                        </button>

                        <button
                          onClick={() => onPause?.(x)}
                          disabled={!isActive || acting}
                          className="rounded-lg p-2 hover:bg-rose-50 disabled:opacity-40 dark:hover:bg-slate-800"
                          title={t("partner.service_table.action_pause")}
                        >
                          <LockClosedIcon className="h-5 w-5 text-rose-600" />
                        </button>

                        <button
                          onClick={() => onResume?.(x)}
                          disabled={!isPaused || acting}
                          className="rounded-lg p-2 hover:bg-emerald-50 disabled:opacity-40 dark:hover:bg-slate-800"
                          title={t("partner.service_table.action_resume")}
                        >
                          <LockOpenIcon className="h-5 w-5 text-emerald-600" />
                        </button>

                        <button
                          onClick={() => onRequestUnlock?.(x)}
                          disabled={!isBlocked || acting}
                          className="rounded-lg p-2 hover:bg-sky-50 disabled:opacity-40 dark:hover:bg-slate-800"
                          title={t("partner.service_table.action_request_unlock")}
                        >
                          <PaperAirplaneIcon className="h-5 w-5 text-sky-600" />
                        </button>

                        <button
                          onClick={() => onDelete?.(x)}
                          disabled={acting}
                          className="rounded-lg p-2 hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-800"
                          title={t("partner.service_table.action_delete")}
                        >
                          <TrashIcon className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </AnimatePresence>
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
