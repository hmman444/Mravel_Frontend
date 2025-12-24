"use client";

import { Dialog } from "@headlessui/react";
import { useState, useEffect } from "react";

export default function ReasonModal({ open, title, confirmText, loading, onClose, onConfirm }) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900">
          <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-white">
            {title}
          </Dialog.Title>

          <div className="mt-3">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Lý do
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none
                focus:ring-2 focus:ring-blue-500/25 focus:border-blue-400
                dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100"
              placeholder="Nhập lý do..."
            />
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium
                hover:bg-slate-50 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-200 dark:hover:bg-slate-900"
              disabled={loading}
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={() => onConfirm(reason.trim())}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-700 disabled:opacity-60"
              disabled={loading || !reason.trim()}
            >
              {confirmText}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
