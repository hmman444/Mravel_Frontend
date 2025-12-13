// src/features/booking/components/hotel/HotelBookingSelectedRoomCard.jsx
import { CalendarDays, Users, Wifi, ShieldCheck, Info } from "lucide-react";

const FULL_VN_DATE = (d) =>
  d?.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function HotelBookingSelectedRoomCard({
  hotelName,
  roomName,
  nights = 1,
  guests = 2,
  roomsCount = 1,
  checkInDate,
  checkOutDate,
  remainingRoomsText = "Đang kiểm tra phòng trống...",
  isEnoughRooms = true,
  refundable, // true / false / null
}) {
  const checkInLabel = checkInDate ? FULL_VN_DATE(checkInDate) : "--";
  const checkOutLabel = checkOutDate ? FULL_VN_DATE(checkOutDate) : "--";

  let refundText = "Đặt phòng này không được hoàn tiền.";
  if (refundable === true) {
    refundText = "Có thể hoàn tiền / miễn phí huỷ theo chính sách.";
  }

  return (
    <section className="rounded-2xl border border-blue-200 bg-blue-50/60 shadow-sm">
      {/* Banner cảnh báo */}
      <div className="flex items-center gap-2 rounded-t-2xl bg-gradient-to-r from-yellow-100 via-yellow-50 to-blue-50 px-4 py-2 text-[11px] font-semibold text-yellow-800">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-yellow-500 text-[10px] text-white">
          !
        </span>
        <p>
          Dừng khoảnh khắc chỉ là 2 giây!{" "}
          <span className={`${isEnoughRooms ? "text-red-600" : "text-red-700"}`}>
            {remainingRoomsText}
          </span>{" "}
          cho khách sạn này.
          {!isEnoughRooms && (
            <span className="ml-2 font-bold text-red-700">
              (Không đủ số phòng bạn chọn)
            </span>
          )}
        </p>
      </div>

      {/* Nội dung chính */}
      <div className="space-y-4 px-4 pb-4 pt-3 md:px-5 md:pb-5">
        {/* Tiêu đề + room */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {hotelName || "Khách sạn của bạn"}
          </p>
          <p className="text-sm font-semibold text-gray-900 md:text-base">
            ({roomsCount}x) {roomName || "Superior Double/Twin"}
          </p>
          <p className="text-xs font-semibold text-red-600 md:text-sm">
            {remainingRoomsText}
          </p>
        </div>

        {/* Check-in / Check-out */}
        <div className="grid grid-cols-2 gap-3 rounded-xl bg-white p-3 text-xs text-gray-800 md:text-sm">
          <div className="flex flex-col gap-1 border-r border-dashed border-gray-200 pr-3">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Nhận phòng
            </span>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-600" />
              <span>{checkInLabel}</span>
            </div>
            <span className="text-[11px] text-gray-500">Từ 14:00</span>
          </div>
          <div className="flex flex-col gap-1 pl-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
              Trả phòng
            </span>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-600" />
              <span>{checkOutLabel}</span>
            </div>
            <span className="text-[11px] text-gray-500">Trước 12:00</span>
          </div>
        </div>

        {/* Info hàng ngang */}
        <div className="space-y-1 text-xs text-gray-700 md:text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-600" />
            <span>
              {guests} khách · {roomsCount} phòng · {nights} đêm
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gray-600" />
            <span>{refundText}</span>
          </div>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-gray-600" />
            <span>Không thể thay đổi ngày lưu trú.</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-gray-600" />
            <span>WiFi miễn phí, các tiện nghi cơ bản khác.</span>
          </div>
        </div>
      </div>
    </section>
  );
}