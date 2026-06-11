import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

export default function InfoModal({
  open,
  title,
  message = "",
  onClose,
  primaryText,
}) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("booking.info_modal_title");
  const resolvedPrimaryText = primaryText ?? t("booking.info_modal_understood");

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 px-3"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl bg-white dark:bg-gray-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-5 py-4">
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{resolvedTitle}</div>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-5 pb-5 pt-4">
          <p className="text-sm text-gray-800 dark:text-gray-200">{message}</p>

          <button
            type="button"
            className="mt-4 w-full rounded-2xl bg-[#007bff] py-2.5 text-sm font-semibold text-white hover:bg-[#ff6b1a]"
            onClick={onClose}
          >
            {resolvedPrimaryText}
          </button>
        </div>
      </div>
    </div>
  );
}