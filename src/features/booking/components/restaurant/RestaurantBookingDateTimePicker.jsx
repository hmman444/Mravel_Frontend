// src/features/booking/components/restaurant/RestaurantBookingDateTimePicker.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { FaClock, FaCalendarAlt } from "react-icons/fa";
import MravelDatePicker from "../../../../components/MravelDatePicker";
import {
  buildTimeOptionsFromOpeningHours,
  getOpeningLabelForDate,
} from "../../services/openingHoursUtils";

const VN_DATE = (d) =>
  d?.toLocaleDateString("vi-VN", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export default function RestaurantBookingDateTimePicker({
  date,
  time,
  onChange, // ({ date, time })
  openingHours = [],      // ✅ thêm
  stepMinutes = 30,       // ✅ thêm
}) {
  const [openTime, setOpenTime] = useState(false);
  const timeRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (timeRef.current && !timeRef.current.contains(e.target)) setOpenTime(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const timeOptions = useMemo(
    () => buildTimeOptionsFromOpeningHours(openingHours, date, stepMinutes),
    [openingHours, date, stepMinutes]
  );

  const openingLabel = useMemo(
    () => getOpeningLabelForDate(openingHours, date),
    [openingHours, date]
  );

  // ✅ auto-fix time khi đổi ngày / đổi openingHours
  useEffect(() => {
    if (!timeOptions.length) {
      if (time) onChange?.({ date, time: "" });
      return;
    }
    if (!time || !timeOptions.includes(time)) {
      onChange?.({ date, time: timeOptions[0] });
    }
    // eslint-disable-next-line
  }, [timeOptions]);

  const summary = useMemo(() => {
    const d = date ? VN_DATE(date) : "Chọn ngày";
    const t = time || "Chọn giờ";
    return `${d} • ${t}`;
  }, [date, time]);

  const disabledTime = !timeOptions.length;

  return (
    <div className="space-y-2">
      <div className="text-[13px] font-semibold text-gray-700">Thời gian đến</div>

      <div className="text-[11px] text-gray-500">{openingLabel}</div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Date */}
        <div className="h-11 rounded-lg border border-gray-300 px-3 bg-white flex items-center relative">
          <FaCalendarAlt className="text-gray-400 mr-2" />
          <MravelDatePicker
            selected={date}
            onChange={(d) => onChange?.({ date: d, time })}
            popperPlacement="bottom-start"
            popperModifiers={[
              { name: "offset", options: { offset: [0, 8] } },
              { name: "preventOverflow", options: { padding: 8 } },
            ]}
            popperContainer={(props) => <div {...props} className="z-[9999]" />}
            className="w-full bg-transparent outline-none text-sm text-gray-800 cursor-pointer"
          />
        </div>

        {/* Time */}
        <div
          ref={timeRef}
          className={[
            "relative h-11 rounded-lg border px-3 bg-white flex items-center",
            disabledTime ? "border-gray-200 cursor-not-allowed opacity-70" : "border-gray-300 cursor-pointer",
          ].join(" ")}
          onClick={() => {
            if (disabledTime) return;
            setOpenTime((v) => !v);
          }}
        >
          <FaClock className="text-gray-400 mr-2" />
          <span className={`text-sm ${time ? "text-gray-800" : "text-gray-400"}`}>
            {disabledTime ? "Nhà hàng đóng cửa" : (time || "Chọn giờ")}
          </span>
          <span className="ml-auto text-gray-400">▾</span>

          {openTime && (
            <div
              className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-xl border border-gray-200 bg-white shadow-xl max-h-64 overflow-y-auto py-2"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="px-3 pb-1 text-xs font-semibold text-gray-500">
                Giờ (cách nhau {stepMinutes} phút)
              </div>

              {timeOptions.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition ${
                    t === time
                      ? "bg-sky-50 text-sky-700 font-semibold"
                      : "text-gray-800 hover:bg-gray-50"
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange?.({ date, time: t });
                    setOpenTime(false);
                  }}
                >
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="text-[11px] text-gray-500">
        Đã chọn: <span className="font-semibold">{summary}</span>
      </div>
    </div>
  );
}