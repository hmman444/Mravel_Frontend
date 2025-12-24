// src/features/partner/components/hotel/TopBar.jsx
import { ArrowLeftIcon, CheckIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

export default function TopBar({
  loading = false,
  onBack,
  onReset,
  onSubmit,
  canSubmit = true,

  // new props (customizable text)
  title = "Thêm khách sạn",
  subtitle = "Sau khi tạo sẽ về PENDING chờ admin duyệt.",
  submitLabel = "Lưu khách sạn",
  submittingLabel = "Đang lưu...",
}) {
  return (
    <div className="bg-white rounded-2xl border p-4 flex flex-wrap items-center justify-between gap-3">
      <div>
        <div className="text-xl font-bold">{title}</div>
        {subtitle ? <div className="text-xs text-gray-500">{subtitle}</div> : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={loading}
          className="px-3 py-2 rounded-xl border hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          Trở về
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
          {loading ? submittingLabel : submitLabel}
        </button>
      </div>
    </div>
  );
}