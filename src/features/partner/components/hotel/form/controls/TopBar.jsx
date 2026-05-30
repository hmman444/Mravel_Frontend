// src/features/partner/components/hotel/TopBar.jsx
import { ArrowLeftIcon, CheckIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

export default function TopBar({
  loading = false,
  onBack,
  onReset,
  onSubmit,
  canSubmit = true,

  // new props (customizable text)
  title,
  subtitle,
  submitLabel,
  submittingLabel,
}) {
  const { t } = useTranslation();
  const resolvedTitle = title ?? t("partner.hotel_form.add_title");
  const resolvedSubtitle = subtitle ?? t("partner.hotel_form.pending_note");
  const resolvedSubmitLabel = submitLabel ?? t("partner.hotel_form.save_hotel");
  const resolvedSubmittingLabel = submittingLabel ?? t("common.saving");
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-xl font-bold">{resolvedTitle}</div>
        {resolvedSubtitle ? <div className="text-xs text-gray-500 dark:text-gray-400">{resolvedSubtitle}</div> : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-3 py-2 rounded-xl border hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          {t("common.back")}
        </button>

        <button
          type="button"
          onClick={onReset}
          disabled={loading}
          className="px-3 py-2 rounded-xl border hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
          title="Reset form"
        >
          <ArrowPathIcon className="w-5 h-5" />
          Reset
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={loading || !canSubmit}
          className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <CheckIcon className="w-5 h-5" />
          {loading ? resolvedSubmittingLabel : resolvedSubmitLabel}
        </button>
      </div>
    </div>
  );
}