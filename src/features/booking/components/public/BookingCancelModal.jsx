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
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[999] px-3">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-gray-900">Xác nhận hủy đơn</h3>
        <p className="text-sm text-gray-600 mt-1">
          Mã: <span className="font-medium text-gray-900">{code}</span>
          {serviceName ? (
            <>
              {" "}• Dịch vụ: <span className="font-medium text-gray-900">{serviceName}</span>
            </>
          ) : null}
        </p>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Lý do hủy (ngắn gọn)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border rounded-lg p-2 h-24 outline-none focus:ring focus:border-blue-500"
            placeholder="Ví dụ: Đổi lịch, không thể đến đúng giờ..."
          />

          <p className="text-xs text-gray-400 mt-2">
            Rule: chỉ hủy khi <b>chưa tới thời điểm sử dụng</b> và <b>chưa bị hủy</b>.
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
            Bỏ qua
          </button>
          <button
            onClick={onSubmit}
            className={`px-4 py-2 rounded-md text-white ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 hover:bg-red-700"
            }`}
            disabled={loading}
            type="button"
          >
            {loading ? "Đang hủy..." : "Xác nhận hủy"}
          </button>
        </div>
      </div>
    </div>
  );
}