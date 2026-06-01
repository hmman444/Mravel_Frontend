import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

/**
 * Modal nhập liệu đồng bộ (thay cho window.prompt thô).
 * Hỗ trợ 1 dropdown (selectOptions) và/hoặc 1 ô nhập (input/textarea).
 * onConfirm nhận { select, input }.
 */
export default function PromptModal({
  open,
  title,
  description,
  selectOptions,
  selectLabel,
  defaultSelect,
  inputLabel,
  inputPlaceholder,
  multiline = false,
  defaultInput = "",
  confirmText,
  cancelText,
  tone = "primary",
  onClose,
  onConfirm,
}) {
  const { t } = useTranslation();
  const [select, setSelect] = useState("");
  const [input, setInput] = useState("");

  useEffect(() => {
    if (open) {
      setSelect(defaultSelect ?? (selectOptions?.[0]?.value ?? ""));
      setInput(defaultInput ?? "");
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const confirmCls =
    tone === "danger"
      ? "bg-gradient-to-r from-rose-500 to-red-500"
      : "bg-gradient-to-r from-sky-500 to-blue-600";

  const fieldCls =
    "w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-sky-400 transition";

  return createPortal(
    <div
      className="fixed inset-0 z-[3000] flex items-center justify-center bg-black/40 backdrop-blur-[2px] animate-[fadeBg_0.25s_ease]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl p-6 bg-white/95 dark:bg-gray-900/95 border border-gray-200/60 dark:border-gray-700/60 shadow-[0_12px_40px_rgba(0,0,0,0.15)] animate-[popup_0.22s_ease]"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{description}</p>
        )}

        {selectOptions && (
          <div className="mt-4">
            {selectLabel && (
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {selectLabel}
              </label>
            )}
            <select value={select} onChange={(e) => setSelect(e.target.value)} className={fieldCls}>
              {selectOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {inputLabel !== undefined && (
          <div className="mt-4">
            {inputLabel && (
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                {inputLabel}
              </label>
            )}
            {multiline ? (
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={inputPlaceholder}
                rows={3}
                className={`${fieldCls} resize-none`}
              />
            ) : (
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={inputPlaceholder}
                className={fieldCls}
              />
            )}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm border border-gray-300 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all shadow-sm"
          >
            {cancelText ?? t("common.cancel")}
          </button>
          <button
            onClick={() => onConfirm({ select, input })}
            className={`px-4 py-2 rounded-xl text-sm font-medium text-white shadow-md hover:brightness-110 hover:-translate-y-0.5 transition-all ${confirmCls}`}
          >
            {confirmText ?? t("common.confirm")}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes popup { from { opacity: 0; transform: scale(0.92) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes fadeBg { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>,
    document.body
  );
}
