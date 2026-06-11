// src/features/booking/components/hotel/HotelBookingSelectedRoomCard.jsx
import { CalendarDays, Users, Wifi, ShieldCheck, Info } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  remainingRoomsText,
  isEnoughRooms = true,
  refundable, // true / false / null
}) {
  const { t } = useTranslation();
  const remainingText = remainingRoomsText ?? t("booking.checking_room_availability");
  const checkInLabel = checkInDate ? FULL_VN_DATE(checkInDate) : "--";
  const checkOutLabel = checkOutDate ? FULL_VN_DATE(checkOutDate) : "--";

  let refundText = t("booking.room_non_refundable");
  if (refundable === true) {
    refundText = t("booking.room_refundable");
  }

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
      {/* Banner cảnh báo */}
      <div className="flex items-center gap-2 rounded-t-2xl border-b border-amber-100 bg-gradient-to-r from-amber-50 via-amber-50 to-blue-50 px-4 py-2 text-[11px] font-semibold text-amber-800 dark:border-amber-900/50 dark:from-amber-950/40 dark:via-gray-900 dark:to-gray-800 dark:text-amber-200">
        <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] text-white dark:bg-amber-400 dark:text-gray-900">
          !
        </span>
        <p>
          {t("booking.hurry_banner_prefix")}{" "}
          <span className={`${isEnoughRooms ? "text-red-600" : "text-red-700"}`}>
            {remainingText}
          </span>{" "}
          {t("booking.hurry_banner_suffix")}
          {!isEnoughRooms && (
            <span className="ml-2 font-bold text-red-700">
              {t("booking.not_enough_rooms")}
            </span>
          )}
        </p>
      </div>

      {/* Nội dung chính */}
      <div className="space-y-4 px-4 pb-4 pt-3 md:px-5 md:pb-5">
        {/* Tiêu đề + room */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {hotelName || t("booking.your_hotel")}
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 md:text-base">
            ({roomsCount}x) {roomName || "Superior Double/Twin"}
          </p>
          <p className="text-xs font-semibold text-red-600 md:text-sm">
            {remainingText}
          </p>
        </div>

        {/* Check-in / Check-out */}
        <div className="grid grid-cols-2 gap-3 rounded-xl bg-white dark:bg-gray-800 p-3 text-xs text-gray-800 dark:text-gray-200 md:text-sm">
          <div className="flex flex-col gap-1 border-r border-dashed border-gray-200 dark:border-gray-700 pr-3">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t("booking.check_in")}
            </span>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span>{checkInLabel}</span>
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">{t("booking.check_in_time")}</span>
          </div>
          <div className="flex flex-col gap-1 pl-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {t("booking.check_out")}
            </span>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              <span>{checkOutLabel}</span>
            </div>
            <span className="text-[11px] text-gray-500 dark:text-gray-400">{t("booking.check_out_time")}</span>
          </div>
        </div>

        {/* Info hàng ngang */}
        <div className="space-y-1 text-xs text-gray-700 dark:text-gray-300 md:text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span>
              {t("booking.guests_rooms_nights", { guests, rooms: roomsCount, nights })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span>{refundText}</span>
          </div>
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span>{t("booking.dates_not_changeable")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Wifi className="h-4 w-4 text-gray-600 dark:text-gray-400" />
            <span>{t("booking.free_wifi_amenities")}</span>
          </div>
        </div>
      </div>
    </section>
  );
}