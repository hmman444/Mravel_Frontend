"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircleIcon,
  XMarkIcon,
  ShieldExclamationIcon,
  HandThumbUpIcon,
  NoSymbolIcon,
  LockOpenIcon,
} from "@heroicons/react/24/outline";

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

const statusBadge = (s) => {
  const base = "inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1";
  if (s === "APPROVED") return `${base} bg-emerald-50 text-emerald-700 ring-emerald-200`;
  if (s === "PENDING_REVIEW") return `${base} bg-amber-50 text-amber-800 ring-amber-200`;
  if (s === "REJECTED") return `${base} bg-rose-50 text-rose-700 ring-rose-200`;
  if (s === "BLOCKED") return `${base} bg-slate-100 text-slate-700 ring-slate-200`;
  return `${base} bg-slate-50 text-slate-700 ring-slate-200`;
};

export default function ServiceTable({
  items,
  onApprove,
  onReject,
  onBlock,
  onUnblock,
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="max-h-[72vh] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              <th className="px-4 py-3 w-[64px] text-center">#</th>
              <th className="px-4 py-3 w-[360px]">Dịch vụ</th>
              <th className="px-4 py-3">Partner</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Active</th>
              <th className="px-4 py-3 text-center">Unlock?</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <motion.tbody layout>
            <AnimatePresence initial={false}>
              {items.map((x, idx) => {
                const st = x.moderationStatus;
                const canApprove = st === "PENDING_REVIEW";
                const canReject = st === "PENDING_REVIEW";
                const canBlock = st === "APPROVED";
                const canUnblock = st === "BLOCKED";

                return (
                  <motion.tr
                    key={x.id}
                    layout
                    variants={fadeUp}
                    initial="hidden"
                    animate="show"
                    exit="exit"
                    transition={{ duration: 0.16 }}
                    className="border-t border-slate-100 hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3 text-center">
                      <span className="inline-flex min-w-[28px] justify-center rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                        {idx + 1}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <div className="truncate font-semibold text-slate-900 dark:text-white">{x.name}</div>
                        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                          {x.slug} • {x.cityName || "—"} • {x.destinationSlug || "—"}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {x.partnerName || "—"}
                      </div>
                      <div className="text-xs text-slate-500">{x.partnerId || "—"}</div>
                    </td>

                    <td className="px-4 py-3">
                      <span className={statusBadge(st)}>{st || "—"}</span>
                      {x.rejectionReason ? (
                        <div className="mt-1 text-xs text-rose-600 line-clamp-2">
                          Reject: {x.rejectionReason}
                        </div>
                      ) : null}
                      {x.blockedReason ? (
                        <div className="mt-1 text-xs text-slate-600 line-clamp-2">
                          Block: {x.blockedReason}
                        </div>
                      ) : null}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {x.active ? (
                        <span className="inline-flex items-center justify-center text-emerald-600">
                          <CheckCircleIcon className="h-6 w-6" />
                        </span>
                      ) : (
                        <span className="inline-flex items-center justify-center text-slate-400">
                          <XMarkIcon className="h-6 w-6" />
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {x.unlockRequestedAt ? (
                        <span className="inline-flex items-center gap-1 text-amber-700">
                          <ShieldExclamationIcon className="h-5 w-5" />
                          <span className="text-xs font-semibold">Có</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => canApprove && onApprove?.(x)}
                          disabled={!canApprove}
                          className="rounded-lg p-2 hover:bg-emerald-50 disabled:opacity-40 dark:hover:bg-slate-800"
                          title="Approve"
                        >
                          <HandThumbUpIcon className="h-5 w-5 text-emerald-700" />
                        </button>

                        <button
                          onClick={() => canReject && onReject?.(x)}
                          disabled={!canReject}
                          className="rounded-lg p-2 hover:bg-rose-50 disabled:opacity-40 dark:hover:bg-slate-800"
                          title="Reject"
                        >
                          <XMarkIcon className="h-5 w-5 text-rose-600" />
                        </button>

                        <button
                          onClick={() => canBlock && onBlock?.(x)}
                          disabled={!canBlock}
                          className="rounded-lg p-2 hover:bg-amber-50 disabled:opacity-40 dark:hover:bg-slate-800"
                          title="Block"
                        >
                          <NoSymbolIcon className="h-5 w-5 text-amber-700" />
                        </button>

                        <button
                          onClick={() => canUnblock && onUnblock?.(x)}
                          disabled={!canUnblock}
                          className="rounded-lg p-2 hover:bg-sky-50 disabled:opacity-40 dark:hover:bg-slate-800"
                          title="Unblock"
                        >
                          <LockOpenIcon className="h-5 w-5 text-sky-700" />
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
