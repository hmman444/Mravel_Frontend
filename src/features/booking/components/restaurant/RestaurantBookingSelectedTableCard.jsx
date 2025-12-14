import { CalendarDays, Users, Info, Hash } from "lucide-react";

const FULL_VN_DATE = (d) =>
  d?.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function RestaurantBookingSelectedTableCard({
  restaurantName,
  restaurantSlug,
  adults = 2,
  children = 0,
  date,
  time,
  tableType,
  tablesCount = 1,

  remainingText = "Đang kiểm tra bàn trống...",
  isEnough = true,
  isSeatEnough = true,
  seatErrorText = "",
}) {
  const people = Number(adults || 0) + Number(children || 0);
  const dateLabel = date ? FULL_VN_DATE(date) : "--";
  const seats = tableType?.seats ?? null;

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50/60 shadow-sm">
      <div className="flex items-center gap-2 rounded-t-2xl bg-gradient-to-r from-yellow-100 via-yellow-50 to-blue-50 px-4 py-2 text-[11px] font-semibold text-yellow-800">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-[10px] text-white">
          !
        </span>
        <p>
          {remainingText}{" "}
          {!isEnough && (
            <span className="ml-1 font-bold text-red-700">
              (Không đủ số bàn bạn chọn)
            </span>
          )}
        </p>
      </div>

      <div className="space-y-4 px-4 pb-4 pt-3 md:px-5 md:pb-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {restaurantName || "Nhà hàng của bạn"}
          </p>

          <p className="text-sm font-semibold text-gray-900 md:text-base">
            ({tablesCount}x) {tableType?.name || "Loại bàn"}{" "}
            {seats ? <span className="text-xs font-medium text-gray-600">• {seats} chỗ/bàn</span> : null}
          </p>

          {restaurantSlug ? (
            <p className="text-[11px] text-gray-500 flex items-center gap-1">
              <Hash className="h-3.5 w-3.5" />
              <span className="font-mono">{restaurantSlug}</span>
            </p>
          ) : null}
           {!isSeatEnough ? (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 border border-red-200">
              {seatErrorText || "Không đủ chỗ ngồi theo số bàn đã chọn."}
            </div>
          ) : null}
        </div>

        <div className="rounded-xl bg-white p-3 text-xs text-gray-800 md:text-sm space-y-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gray-600" />
            <span>
              {dateLabel} • <span className="font-semibold">{time || "--:--"}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-600" />
            <span>
              {people} khách ({adults} NL, {children} TE) • {tablesCount} bàn
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-gray-600" />
            <span>Đặt cọc để giữ bàn theo khung giờ đã chọn.</span>
          </div>
        </div>
      </div>
    </section>
  );
}