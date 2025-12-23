"use client";

// src/features/admin/components/user/UserTable.jsx
import { AnimatePresence, motion } from "framer-motion";
import {
  LockClosedIcon,
  LockOpenIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import { ROLE_LABEL, STATUS_LABEL, STATUS_BADGE } from "./userTerms";

const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 }, exit: { opacity: 0, y: 8 } };

export default function UserTable({
  items,
  rowBusy,            // (id) => boolean
  onLock,             // (id) => ...
  onUnlock,           // (id) => ...
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:bg-slate-900 dark:border-slate-800">
      <div className="max-h-[72vh] overflow-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-slate-950">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300">
              <th className="px-4 py-3 w-[64px] text-center">#</th>
              <th className="px-4 py-3 w-[280px]">Email</th>
              <th className="px-4 py-3 w-[280px]">Họ tên</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">OTP</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <motion.tbody layout>
            <AnimatePresence initial={false}>
              {items.map((u, idx) => {
                const busy = rowBusy?.(u.id);
                const locked = u.status === "LOCKED";
                const isAdmin = u.role === "ADMIN";

                return (
                  <motion.tr
                    key={u.id}
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
                      <div className="font-medium text-slate-900 dark:text-white">{u.email}</div>
                      <div className="text-xs text-slate-500">ID: {u.id}</div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {u.fullname || <span className="italic text-slate-400">Chưa có</span>}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700">
                        {ROLE_LABEL[u.role] || u.role}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {u.enabled ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600">
                          <ShieldCheckIcon className="h-5 w-5" />
                          Đã xác thực
                        </span>
                      ) : (
                        <span className="text-slate-500">Chưa OTP</span>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ring-1 ${STATUS_BADGE(u.status)}`}>
                        {STATUS_LABEL[u.status] || u.status}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        {locked ? (
                          <button
                            onClick={() => onUnlock?.(u.id)}
                            disabled={busy || isAdmin}
                            className="rounded-lg p-2 hover:bg-emerald-50 disabled:opacity-50 dark:hover:bg-slate-800"
                            title={isAdmin ? "Không thao tác ADMIN" : "Mở khóa"}
                          >
                            <LockOpenIcon className="h-5 w-5 text-emerald-600" />
                          </button>
                        ) : (
                          <button
                            onClick={() => onLock?.(u.id)}
                            disabled={busy || isAdmin}
                            className="rounded-lg p-2 hover:bg-rose-50 disabled:opacity-50 dark:hover:bg-slate-800"
                            title={isAdmin ? "Không thao tác ADMIN" : "Khóa"}
                          >
                            <LockClosedIcon className="h-5 w-5 text-rose-600" />
                          </button>
                        )}
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
