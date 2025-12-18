import { X } from "lucide-react";

export default function InfoModal({
  open,
  title = "Thông báo",
  message = "",
  onClose,
  primaryText = "Đã hiểu",
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-3"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <div className="text-sm font-semibold text-gray-900">{title}</div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gray-100 text-gray-700 hover:bg-gray-200"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-5 pt-4">
          <p className="text-sm text-gray-800">{message}</p>

          <button
            type="button"
            className="mt-4 w-full rounded-2xl bg-[#007bff] py-2.5 text-sm font-semibold text-white hover:bg-[#ff6b1a]"
            onClick={onClose}
          >
            {primaryText}
          </button>
        </div>
      </div>
    </div>
  );
}