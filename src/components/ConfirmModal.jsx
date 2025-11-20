import React from "react";
import { createPortal } from "react-dom";

export default function ConfirmModal({
  open,
  title = "Xác nhận",
  message = "Bạn có chắc muốn thực hiện thao tác này?",
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  onClose,
  onConfirm,
}) {
  if (!open) return null;

  return createPortal(
    <div
      className="
        fixed inset-0 z-[3000]
        flex items-center justify-center
        bg-black/40 backdrop-blur-[2px]
        animate-[fadeBg_0.25s_ease]
      "
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full max-w-sm rounded-2xl p-6
          bg-white/95 dark:bg-gray-900/95
          border border-gray-200/60 dark:border-gray-700/60
          shadow-[0_12px_40px_rgba(0,0,0,0.15)]
          animate-[popup_0.22s_ease]
        "
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          {message}
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="
              px-4 py-2 rounded-xl text-sm
              border border-gray-300 dark:border-gray-700
              bg-white/80 dark:bg-gray-900/80
              text-gray-700 dark:text-gray-200
              hover:bg-gray-50 dark:hover:bg-gray-800
              transition-all shadow-sm
            "
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className="
              px-4 py-2 rounded-xl text-sm font-medium
              bg-gradient-to-r from-rose-500 to-red-500
              text-white shadow-md
              hover:brightness-110 hover:-translate-y-0.5
              transition-all
            "
          >
            {confirmText}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes popup {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(8px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes fadeBg {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>,
    document.body
  );
}
