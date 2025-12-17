"use client";

// src/features/admin/components/amenity/AmenityFormModal.jsx
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  XMarkIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import {
  SCOPE_OPTIONS,
  GROUP_OPTIONS,
  SECTION_OPTIONS,
  SCOPE_LABEL,
  GROUP_LABEL,
  SECTION_LABEL,
  labelOf,
} from "./amenityTerms";

const ui = {
  panel:
    "w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-[0_20px_60px_rgba(2,6,23,0.18)] dark:border-slate-800/70 dark:bg-slate-900",
  header:
    "relative px-6 py-3 border-b border-slate-200/70 dark:border-slate-800/70",
  headerBg:
    "absolute inset-0 bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10 dark:from-sky-500/15 dark:via-blue-500/10 dark:to-indigo-500/10",
  body: "px-6 py-4",
  footer:
    "px-6 py-3 border-t border-slate-200/70 dark:border-slate-800/70 bg-slate-50/60 dark:bg-slate-950/30",

  label: "mb-1.5 block text-xs font-semibold text-slate-600 dark:text-slate-300",
  req: "ml-1 text-rose-500",
  hint: "mt-1 text-[12px] text-slate-500 dark:text-slate-400",

  input:
    "w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100",
  select:
    "w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100",
  textarea:
    "w-full min-h-[92px] resize-none rounded-2xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-100",

  btn:
    "inline-flex items-center justify-center rounded-2xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98]",
  btnPrimary:
    "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-[0_10px_28px_rgba(37,99,235,0.22)] hover:brightness-110 disabled:opacity-60",
  btnGhost:
    "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900",

  errorBox:
    "mt-4 flex gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-200",
};

const modalBackdrop = { hidden: { opacity: 0 }, show: { opacity: 1 }, exit: { opacity: 0 } };
const modalPanel = {
  hidden: { opacity: 0, y: 18, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 12, scale: 0.99 },
};

export default function AmenityFormModal({
  t,
  open,
  saving,
  editing,
  onClose,
  onSubmit,
  apiError,        // <-- NEW: message lỗi từ BE (nếu có)
  onClearError,    // <-- NEW: clear error khi user sửa form/đóng modal
}) {
  const isEdit = !!editing;

  const title = useMemo(() => {
    return isEdit ? t("edit_amenity") : t("add_new_amenity");
  }, [isEdit, t]);

  const sub = useMemo(() => {
    return isEdit
      ? "Cập nhật thông tin hiển thị. Code + Scope không nên trùng trong cùng scope."
      : "Tạo tiện nghi mới. Code khuyến nghị dạng UPPER_SNAKE (ví dụ: WIFI_FREE).";
  }, [isEdit]);

  const Required = () => <span className={ui.req}>*</span>;

  // clear error khi bấm ESC / click backdrop (để không còn lỗi cũ mở lại)
  const handleClose = () => {
    onClearError?.();
    onClose?.();
  };

  const handleAnyChange = () => {
    // user đã bắt đầu sửa → xoá error cũ cho đỡ “ám”
    if (apiError) onClearError?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          variants={modalBackdrop}
          initial="hidden"
          animate="show"
          exit="exit"
          transition={{ duration: 0.18 }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <motion.form
            onSubmit={onSubmit}
            variants={modalPanel}
            initial="hidden"
            animate="show"
            exit="exit"
            transition={{ duration: 0.2 }}
            className={ui.panel}
            onChange={handleAnyChange}
          >
            {/* Header */}
            <div className={ui.header}>
              <div className={ui.headerBg} />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
                    {title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {sub}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-2xl p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                  title={t("cancel")}
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className={ui.body}>
              {/* API Error box */}
              {apiError && (
                <div className={ui.errorBox} role="alert" aria-live="polite">
                  <ExclamationTriangleIcon className="h-5 w-5 flex-none" />
                  <div className="min-w-0">
                    <div className="font-semibold">Không thể lưu</div>
                    <div className="mt-0.5 break-words">{apiError}</div>
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Code * */}
                <div>
                  <label className={ui.label}>
                    Code <Required />
                  </label>
                  <input
                    name="code"
                    defaultValue={editing?.code || ""}
                    placeholder="WIFI_FREE"
                    className={ui.input}
                    required
                  />
                  <div className={ui.hint}>Unique theo (code + scope). Khuyến nghị UPPER_SNAKE.</div>
                </div>

                {/* Icon (optional) */}
                <div>
                  <label className={ui.label}>Icon</label>
                  <input
                    name="icon"
                    defaultValue={editing?.icon || ""}
                    placeholder="wifi / parking / 🍳 ..."
                    className={ui.input}
                  />
                  <div className={ui.hint}>Có thể nhập key (wifi, parking...) hoặc emoji.</div>
                </div>

                {/* Name * */}
                <div className="sm:col-span-2">
                  <label className={ui.label}>
                    {t("amenity_name")} <Required />
                  </label>
                  <input
                    name="name"
                    defaultValue={editing?.name || ""}
                    placeholder="Wi-Fi miễn phí"
                    className={ui.input}
                    required
                  />
                </div>

                {/* Description (optional) */}
                <div className="sm:col-span-2">
                  <label className={ui.label}>{t("short_desc")}</label>
                  <textarea
                    name="description"
                    defaultValue={editing?.description || ""}
                    placeholder="Mô tả ngắn gọn để hiển thị..."
                    className={ui.textarea}
                  />
                </div>

                {/* Scope * */}
                <div>
                  <label className={ui.label}>
                    Scope <Required />
                  </label>
                  <select
                    name="scope"
                    defaultValue={editing?.scope || "HOTEL"}
                    className={ui.select}
                    required
                  >
                    {SCOPE_OPTIONS.filter((x) => x !== "ALL").map((s) => (
                      <option key={s} value={s}>
                        {labelOf(SCOPE_LABEL, s)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Group * */}
                <div>
                  <label className={ui.label}>
                    Group <Required />
                  </label>
                  <select
                    name="group"
                    defaultValue={editing?.group || "OTHER"}
                    className={ui.select}
                    required
                  >
                    {GROUP_OPTIONS.filter((x) => x !== "ALL").map((g) => (
                      <option key={g} value={g}>
                        {labelOf(GROUP_LABEL, g)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section * */}
                <div className="sm:col-span-2">
                  <label className={ui.label}>
                    Section <Required />
                  </label>
                  <select
                    name="section"
                    defaultValue={editing?.section || "OTHER"}
                    className={ui.select}
                    required
                  >
                    {SECTION_OPTIONS.filter((x) => x !== "ALL").map((s) => (
                      <option key={s} value={s}>
                        {labelOf(SECTION_LABEL, s)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* BỎ "Hoạt động" khỏi modal */}
              </div>
            </div>

            {/* Footer */}
            <div className={ui.footer}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-xs text-slate-500 dark:text-slate-400">
                </div>

                <div className="flex justify-end gap-2">
                  <button type="button" onClick={handleClose} className={`${ui.btn} ${ui.btnGhost}`}>
                    {t("cancel")}
                  </button>
                  <button type="submit" disabled={saving} className={`${ui.btn} ${ui.btnPrimary}`}>
                    {saving ? `${t("saving")}...` : t("save")}
                  </button>
                </div>
              </div>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
