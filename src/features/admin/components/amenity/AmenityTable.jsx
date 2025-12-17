"use client";

// src/features/admin/components/amenity/AmenityTable.jsx
import { AnimatePresence, motion } from "framer-motion";
import {
  PencilIcon,
  CheckCircleIcon,
  XMarkIcon,
  NoSymbolIcon,
  PowerIcon,
} from "@heroicons/react/24/outline";
import { AmenityIcon } from "../../../catalog/utils/AmenityIcon";
import { SCOPE_LABEL, GROUP_LABEL, SECTION_LABEL, labelOf } from "./amenityTerms";

const badgeClass = (scope) => {
  if (scope === "HOTEL") return "bg-indigo-50 text-indigo-700 ring-indigo-200";
  if (scope === "ROOM") return "bg-emerald-50 text-emerald-700 ring-emerald-200";
  if (scope === "RESTAURANT") return "bg-amber-50 text-amber-800 ring-amber-200";
  return "bg-slate-50 text-slate-700 ring-slate-200";
};

const fadeUp = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
};

export default function AmenityTable({
  t,
  items,
  deleting,
  onEdit,
  onDeactivate, // (id) => ...
  onActivate, // (id) => ...
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="max-h-[72vh] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              <th className="px-4 py-3 w-[64px] text-center">#</th>
              <th className="px-4 py-3 w-[360px]">Tiện nghi</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Scope</th>
              <th className="px-4 py-3">Group</th>
              <th className="px-4 py-3">Section</th>
              <th className="px-4 py-3 text-center">Active</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <motion.tbody layout>
            <AnimatePresence initial={false}>
              {items.map((a, idx) => (
                <motion.tr
                  key={a.id}
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
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800">
                        <AmenityIcon iconKey={a.icon} className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="max-w-[240px] truncate font-semibold text-slate-900 dark:text-white">
                            {a.name}
                          </div>
                        </div>

                        {a.description ? (
                          <div className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                            {a.description}
                          </div>
                        ) : (
                          <div className="mt-0.5 text-xs italic text-slate-400">Chưa có mô tả</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                      {a.code}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${badgeClass(
                        a.scope
                      )}`}
                    >
                      {labelOf(SCOPE_LABEL, a.scope)}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
                      {labelOf(GROUP_LABEL, a.group)}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
                      {labelOf(SECTION_LABEL, a.section)}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    {a.active ? (
                      <span className="inline-flex items-center justify-center text-emerald-600">
                        <CheckCircleIcon className="h-6 w-6" />
                      </span>
                    ) : (
                      <span className="inline-flex items-center justify-center text-slate-400">
                        <XMarkIcon className="h-6 w-6" />
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      {/* Edit */}
                      <button
                        onClick={() => onEdit(a)}
                        className="rounded-lg p-2 hover:bg-blue-50 dark:hover:bg-slate-800"
                        title={t("edit")}
                      >
                        <PencilIcon className="h-5 w-5 text-blue-600" />
                      </button>

                      {/* Toggle active: active -> deactivate, inactive -> activate */}
                      {a.active ? (
                        <button
                          onClick={() => onDeactivate?.(a.id)}
                          disabled={deleting}
                          className="rounded-lg p-2 hover:bg-amber-50 disabled:opacity-50 dark:hover:bg-slate-800"
                          title="Tắt tiện ích"
                        >
                          <NoSymbolIcon className="h-5 w-5 text-amber-600" />
                        </button>
                      ) : (
                        <button
                          onClick={() => onActivate?.(a.id)}
                          disabled={deleting}
                          className="rounded-lg p-2 hover:bg-emerald-50 disabled:opacity-50 dark:hover:bg-slate-800"
                          title="Bật tiện ích"
                        >
                          <PowerIcon className="h-5 w-5 text-emerald-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </motion.tbody>
        </table>
      </div>
    </div>
  );
}
