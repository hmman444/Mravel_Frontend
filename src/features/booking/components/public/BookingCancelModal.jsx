import { useTranslation } from "react-i18next";

export default function CancelBookingModal({
  open,
  code,
  serviceName,
  reason,
  setReason,
  loading,
  error,
  onClose,
  onSubmit,
}) {
  const { t } = useTranslation();
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999] px-3">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t("booking.cancel_confirm_title")}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {t("booking.code_label")} <span className="font-medium text-gray-900 dark:text-gray-100">{code}</span>
          {serviceName ? (
            <>
              {" "}• {t("booking.service_label")} <span className="font-medium text-gray-900 dark:text-gray-100">{serviceName}</span>
            </>
          ) : null}
        </p>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {t("booking.cancel_reason_label")}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded-lg p-2 h-24 outline-none focus:ring focus:border-blue-500"
            placeholder={t("booking.cancel_reason_placeholder")}
          />

          <p className="text-xs text-gray-400 mt-2">
            {t("booking.cancel_rule_note")}
          </p>

          {error ? (
            <div className="mt-3 text-sm bg-red-50 border border-red-100 text-red-700 rounded-lg p-3">
              {String(error)}
            </div>
          ) : null}
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border hover:bg-gray-50"
            disabled={loading}
            type="button"
          >
            {t("common.cancel")}
          </button>
          <button
            onClick={onSubmit}
            className={`px-4 py-2 rounded-md text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
            }`}
            disabled={loading}
            type="button"
          >
            {loading ? t("booking.cancelling") : t("booking.cancel_confirm_button")}
          </button>
        </div>
      </div>
    </div>
  );
}