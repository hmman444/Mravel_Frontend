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
        fixed inset-0 top-0 left-0 right-0 bottom-0
        w-screen h-screen
        z-[3000]
        flex items-center justify-center
        bg-black/50
      "
      role="dialog"
      aria-modal="true"
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm animate-fadeIn">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{message}</p>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border text-gray-700 hover:bg-gray-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
