// src/features/catalog/components/restaurant/RestaurantBookingBox.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { FaMinus, FaPlus, FaClock, FaCalendarAlt } from "react-icons/fa";
import MravelDatePicker from "../../../../components/MravelDatePicker";
import Button from "../../../../components/Button";

import {
  buildTimeOptionsFromOpeningHours,
  getOpeningLabelForDate,
} from "../../../booking/services/openingHoursUtils";

export default function RestaurantBookingBox({
  restaurant,
  onSubmit,
  className = "",
}) {
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);

  const [date, setDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [time, setTime] = useState(""); // "HH:mm"

  const openingHours = restaurant?.openingHours || restaurant?.opening_hours || [];

  //  build timeOptions theo openingHours + date (mỗi 30 phút)
  const timeOptions = useMemo(
    () => buildTimeOptionsFromOpeningHours(openingHours, date, 30),
    [openingHours, date]
  );

  const openingLabel = useMemo(
    () => getOpeningLabelForDate(openingHours, date),
    [openingHours, date]
  );

  const isActive = restaurant?.active !== false;
  console.log("restaurant.active =", restaurant?.active, typeof restaurant?.active);

  //  nếu user đổi ngày mà time hiện tại không còn hợp lệ -> auto chọn slot đầu
  useEffect(() => {
    if (!timeOptions.length) {
      setTime("");
      return;
    }
    if (!time || !timeOptions.includes(time)) setTime(timeOptions[0]);
  }, [timeOptions]); // eslint-disable-line

  /* ===== popover: guests ===== */
  const [openGuests, setOpenGuests] = useState(false);
  const guestsRef = useRef(null);
  useEffect(() => {
    const onDoc = (e) => {
      if (guestsRef.current && !guestsRef.current.contains(e.target)) setOpenGuests(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  /* ===== popover: time ===== */
  const [openTime, setOpenTime] = useState(false);
  const timeRef = useRef(null);
  useEffect(() => {
    const onDoc = (e) => {
      if (timeRef.current && !timeRef.current.contains(e.target)) setOpenTime(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const canSubmit =
    isActive && !!restaurant?.slug && !!date && !!time && timeOptions.length > 0;

  const commit = (e) => {
    e?.preventDefault?.();
    if (!canSubmit) return;

    onSubmit?.({
      restaurantSlug: restaurant?.slug,
      adults,
      children,
      date: date ? new Date(date).toISOString().slice(0, 10) : "",
      time,
    });
  };

  return (
    <div className={["rounded-2xl border border-gray-200 bg-white shadow-sm", "p-4 md:p-5", className].join(" ")}>
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-900">
          Đặt chỗ{" "}
          <span className="font-normal text-gray-600">(Để có chỗ trước khi đến)</span>
        </h3>
        <div className="mt-1 text-sm font-semibold text-rose-600">Giảm 10%</div>
      </div>

      {/* Guests Row */}
      <div className="mt-4">
        <div className="text-sm font-semibold text-gray-700 mb-1">Số khách</div>
        <div ref={guestsRef} className="relative">
          <button
            type="button"
            onClick={() => setOpenGuests((v) => !v)}
            className="w-full h-11 px-3 rounded-lg border border-gray-300 text-left flex items-center gap-2"
          >
            <span className="text-gray-800">
              {adults} người lớn, {children} trẻ em
            </span>
            <span className="ml-auto text-gray-400">▾</span>
          </button>

          {openGuests && (
            <div
              className="absolute z-50 left-0 right-0 top-[calc(100%+8px)] bg-white border border-gray-200 rounded-xl shadow-xl p-3"
              onMouseDown={(e) => e.stopPropagation()}
            >
              {/* Adults */}
              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-gray-800">Người lớn</span>
                <div className="flex items-center gap-2">
                  <button
                    className="w-8 h-8 grid place-items-center rounded border hover:bg-gray-50"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.preventDefault();
                      setAdults((v) => Math.max(1, v - 1));
                    }}
                  >
                    <FaMinus />
                  </button>
                  <span className="w-6 text-center">{adults}</span>
                  <button
                    className="w-8 h-8 grid place-items-center rounded border hover:bg-gray-50"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.preventDefault();
                      setAdults((v) => v + 1);
                    }}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>

              {/* Children */}
              <div className="flex items-center justify-between py-2">
                <span className="font-medium text-gray-800">Trẻ em</span>
                <div className="flex items-center gap-2">
                  <button
                    className="w-8 h-8 grid place-items-center rounded border hover:bg-gray-50"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.preventDefault();
                      setChildren((v) => Math.max(0, v - 1));
                    }}
                  >
                    <FaMinus />
                  </button>
                  <span className="w-6 text-center">{children}</span>
                  <button
                    className="w-8 h-8 grid place-items-center rounded border hover:bg-gray-50"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => {
                      e.preventDefault();
                      setChildren((v) => Math.min(10, v + 1));
                    }}
                  >
                    <FaPlus />
                  </button>
                </div>
              </div>

              <div className="mt-2 flex justify-end">
                <button
                  className="px-3 py-1.5 rounded bg-sky-600 text-white text-sm hover:bg-sky-700"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.preventDefault();
                    setOpenGuests(false);
                  }}
                >
                  Xong
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Date & Time */}
      <div className="mt-4">
        <div className="text-sm font-semibold text-gray-700 mb-1">Thời gian đến</div>

        <div className="text-[11px] text-gray-500 mb-2">
          {openingLabel}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Date */}
          <div className="h-11 rounded-lg border border-gray-300 px-3 bg-white flex items-center relative">
            <FaCalendarAlt className="text-gray-400 mr-2" />
            <MravelDatePicker
              selected={date}
              onChange={(d) => {
                if (!d) return;
                const x = new Date(d);
                x.setHours(0, 0, 0, 0);
                setDate(x);
              }}
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
              timeOptions.length ? "border-gray-300 cursor-pointer" : "border-gray-200 cursor-not-allowed opacity-70",
            ].join(" ")}
            onClick={() => {
              if (!timeOptions.length) return;
              setOpenTime((v) => !v);
            }}
          >
            <FaClock className="text-gray-400 mr-2" />
            <span className={`text-sm ${time ? "text-gray-800" : "text-gray-400"}`}>
              {timeOptions.length ? (time || "Chọn giờ") : "Nhà hàng đóng cửa"}
            </span>
            <span className="ml-auto text-gray-400">▾</span>

            {openTime && (
              <div
                className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-xl border border-gray-200 bg-white shadow-xl max-h-64 overflow-y-auto py-2"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="px-3 pb-1 text-xs font-semibold text-gray-500">
                  Giờ (cách nhau 30 phút)
                </div>

                {timeOptions.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition ${
                      t === time ? "bg-sky-50 text-sky-700 font-semibold" : "text-gray-800 hover:bg-gray-50"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTime(t);
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
      </div>

      {/* Submit */}
      <div className="mt-5">
        <Button
          className={[
            "w-full h-11 rounded-lg text-white font-semibold text-base",
            canSubmit ? "bg-[#ff3b30] hover:bg-[#e2332a]" : "bg-gray-400 cursor-not-allowed",
          ].join(" ")}
          onClick={commit}
          disabled={!canSubmit}
        >
          {isActive ? "Đặt chỗ ngay" : "Nhà hàng đang tạm dừng nhận đặt chỗ"}
        </Button>
      </div>
    </div>
  );
}