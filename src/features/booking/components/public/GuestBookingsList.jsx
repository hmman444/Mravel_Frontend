// src/features/booking/components/public/GuestBookingsList.jsx
import BookingCard from "./BookingCard";

export default function GuestBookingsList({
  loading,
  error,
  items,
  onRefresh,
  onClearDevice,
  onOpenHotel,
  rightActions,
  detailScope = "PUBLIC", // PUBLIC | PRIVATE

  // ✅ NEW
  title = "Đơn trên thiết bị này",
  description = "Danh sách này dựa trên cookie trình duyệt. Nếu bạn xoá dữ liệu trình duyệt, danh sách có thể mất.",
  emptyTitle = "Chưa có đơn nào trên thiết bị này.",
  emptyDescription = "Bạn có thể tra cứu theo mã ở tab “Tra cứu”.",
  showRefresh = true,
  showClearDevice = true,
}) {
  const list = Array.isArray(items) ? items : [];

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 md:text-base">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-xs text-gray-600 md:text-sm">
                {description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center justify-end gap-2">
            {rightActions}

            {showRefresh && typeof onRefresh === "function" && (
              <button
                type="button"
                onClick={onRefresh}
                className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 shadow-sm transition hover:border-blue-400 hover:text-blue-700 md:text-sm"
              >
                Làm mới
              </button>
            )}

            {showClearDevice && typeof onClearDevice === "function" && (
              <button
                type="button"
                onClick={onClearDevice}
                className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 md:text-sm"
              >
                Xoá đơn trên thiết bị
              </button>
            )}
          </div>
        </div>

        {error ? (
          <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        ) : null}

        {loading ? (
          <p className="mt-3 text-xs text-gray-500">Đang tải danh sách đơn...</p>
        ) : null}

        {!loading && !error && list.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4">
            <p className="text-sm font-semibold text-gray-900">{emptyTitle}</p>
            {emptyDescription ? (
              <p className="mt-1 text-xs text-gray-600">{emptyDescription}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      {list.length > 0 ? (
        <div className="space-y-3">
          {list.map((b) => (
            <BookingCard
              key={b.code}
              booking={b}
              onOpenHotel={onOpenHotel}
              onRefresh={onRefresh}
              detailScope={detailScope}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}