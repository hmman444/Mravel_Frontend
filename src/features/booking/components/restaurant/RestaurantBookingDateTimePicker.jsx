// src/features/booking/components/restaurant/RestaurantBookingDateTimePicker.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
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
  openingHours = [],      //  thêm
  stepMinutes = 30,       //  thêm
}) {
  const { t } = useTranslation();
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

  //  auto-fix time khi đổi ngày / đổi openingHours
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
    const d = date ? VN_DATE(date) : t("booking.select_date");
    const tm = time || t("booking.select_time");
    return `${d} • ${tm}`;
  }, [date, time]);

  const disabledTime = !timeOptions.length;

  return (
    <div className="space-y-2">
      <div className="text-[13px] font-semibold text-gray-700 dark:text-gray-300">{t("booking.arrival_time")}</div>

      <div className="text-[11px] text-gray-500 dark:text-gray-400">{openingLabel}</div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {/* Date */}
        <div className="h-11 rounded-lg border border-gray-300 dark:border-gray-700 px-3 bg-white dark:bg-gray-800 flex items-center relative">
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
            className="w-full bg-transparent outline-none text-sm text-gray-800 dark:text-gray-200 cursor-pointer"
          />
        </div>

        {/* Time */}
        <div
          ref={timeRef}
          className={[
            "relative h-11 rounded-lg border px-3 bg-white dark:bg-gray-800 flex items-center",
            disabledTime ? "border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-70" : "border-gray-300 dark:border-gray-700 cursor-pointer",
          ].join(" ")}
          onClick={() => {
            if (disabledTime) return;
            setOpenTime((v) => !v);
          }}
        >
          <FaClock className="text-gray-400 mr-2" />
          <span className={`text-sm ${time ? "text-gray-800 dark:text-gray-200" : "text-gray-400"}`}>
            {disabledTime ? t("booking.restaurant_closed") : (time || t("booking.select_time"))}
          </span>
          <span className="ml-auto text-gray-400">▾</span>

          {openTime && (
            <div
              className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl max-h-64 overflow-y-auto py-2"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <div className="px-3 pb-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
                {t("booking.time_interval", { n: stepMinutes })}
              </div>

              {timeOptions.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition ${
                    t === time
                      ? "bg-sky-50 text-sky-700 font-semibold"
                      : "text-gray-800 dark:text-gray-200 hover:bg-gray-50"
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

      <div className="text-[11px] text-gray-500 dark:text-gray-400">
        {t("booking.selected_label")} <span className="font-semibold">{summary}</span>
      </div>
    </div>
  );
}