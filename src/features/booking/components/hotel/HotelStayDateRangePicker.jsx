// src/features/booking/components/hotel/HotelStayDateRangePicker.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import DatePicker, { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale";
import { addMonths } from "date-fns";
import "react-datepicker/dist/react-datepicker.css";

registerLocale("vi", vi);

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// format ngày kiểu vi-VN ngắn gọn
const VN_DATE = (d) =>
  d.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export default function HotelStayDateRangePicker({
  checkIn,
  checkOut,
  onChange, // ({ checkIn, checkOut, nights })
}) {
  const [startDate, setStartDate] = useState(checkIn);
  const [endDate, setEndDate] = useState(checkOut);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  // sync khi props thay đổi (phòng trường hợp parent update)
  useEffect(() => {
    if (checkIn) setStartDate(checkIn);
    if (checkOut) setEndDate(checkOut);
  }, [checkIn, checkOut]);

  // click outside để đóng popup
  useEffect(() => {
    const handleClick = (e) => {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Tính số ngày & đêm theo logic khách sạn:
  // - 15→15: 1 ngày 1 đêm
  // - 15→16: 2 ngày 1 đêm
  // - 15→17: 3 ngày 2 đêm
  const { nights, days } = useMemo(() => {
    if (!startDate || !endDate) return { nights: 0, days: 0 };

    const s = new Date(startDate);
    const e = new Date(endDate);
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);

    let diffDays = (e.getTime() - s.getTime()) / MS_PER_DAY;
    if (diffDays < 0) diffDays = 0;
    diffDays = Math.round(diffDays);

    // số ngày lưu trú (bao gồm cả ngày check-in & check-out)
    const stayDays = diffDays === 0 ? 1 : diffDays + 1;
    // số đêm:
    // - nếu chỉ 1 ngày: 1 đêm
    // - nếu nhiều hơn: days - 1
    const stayNights = stayDays === 1 ? 1 : stayDays - 1;

    return { nights: stayNights, days: stayDays };
  }, [startDate, endDate]);

  const hasRange = !!startDate && !!endDate;

  const summaryText = hasRange
    ? `${VN_DATE(startDate)} – ${VN_DATE(endDate)} • ${days} ngày ${nights} đêm`
    : "Chọn ngày nhận phòng và trả phòng";

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Ô hiển thị + mở calendar */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-full items-center rounded-lg border border-gray-300 bg-white px-3 text-left text-sm text-gray-800 hover:border-blue-500 focus:outline-none"
      >
        <span className={hasRange ? "" : "text-gray-400"}>
          {summaryText}
        </span>
        <span className="ml-auto text-gray-400 text-xs">▾</span>
      </button>

      {/* Popup calendar (không card nền bao quanh) */}
      {open && (
        <div className="absolute z-50 mt-2">
          <DatePicker
            inline
            selectsRange
            locale="vi"
            startDate={startDate}
            endDate={endDate}
            minDate={today}
            monthsShown={2}
            calendarClassName="mravel-calendar"
            onChange={(dates) => {
              const [start, end] = dates;

              // Lần click đầu: set start, reset end
              if (start && !end) {
                setStartDate(start);
                setEndDate(null);
                return;
              }

              // Khi đã có cả start và end
              if (start && end) {
                const s = new Date(start);
                const e = new Date(end);
                s.setHours(0, 0, 0, 0);
                e.setHours(0, 0, 0, 0);

                let diffDays = (e.getTime() - s.getTime()) / MS_PER_DAY;
                if (diffDays < 0) diffDays = 0;
                diffDays = Math.round(diffDays);

                const stayDays = diffDays === 0 ? 1 : diffDays + 1;
                const stayNights = stayDays === 1 ? 1 : stayDays - 1;

                setStartDate(s);
                setEndDate(e);

                onChange?.({
                  checkIn: s,
                  checkOut: e,
                  nights: stayNights, // 1 hoặc hơn
                });
              }
            }}
            renderCustomHeader={({
              date,
              decreaseMonth,
              increaseMonth,
              prevMonthButtonDisabled,
              nextMonthButtonDisabled,
              customHeaderCount,
            }) => {
              const shownDate = addMonths(date, customHeaderCount);
              const month = shownDate.getMonth() + 1;
              const year = shownDate.getFullYear();

              const isFirst = customHeaderCount === 0; // cột trái
              const isLast = customHeaderCount === 1; // cột phải (vì monthsShown = 2)

              return (
                <div className="mravel-calendar__header-row">
                  {isFirst && (
                    <button
                      type="button"
                      onClick={decreaseMonth}
                      disabled={prevMonthButtonDisabled}
                      className="mravel-calendar__nav-btn"
                    >
                      ‹
                    </button>
                  )}

                  <span className="mravel-calendar__header-title">
                    Tháng {month} {year}
                  </span>

                  {isLast && (
                    <button
                      type="button"
                      onClick={increaseMonth}
                      disabled={nextMonthButtonDisabled}
                      className="mravel-calendar__nav-btn"
                    >
                      ›
                    </button>
                  )}
                </div>
              );
            }}
          />

          {/* Text mô tả dưới calendar */}
          <div className="mt-2 text-xs text-gray-500 px-1">
            {hasRange
              ? `Đã chọn ${days} ngày ${nights} đêm`
              : "Chọn ngày nhận phòng, sau đó chọn ngày trả phòng."}
          </div>
        </div>
      )}
    </div>
  );
}