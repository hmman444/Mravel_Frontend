import { useEffect, useMemo, useRef, useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaCalendarAlt,
  FaClock,
  FaSearch,
  FaUsers,
  FaUtensils,
} from "react-icons/fa";
import Button from "../../../../components/Button";
import DestinationTypeahead from "../../../../components/DestinationTypeahead";
import MravelDatePicker from "../../../../components/MravelDatePicker";

const formatDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

// Tạo list giờ tự động, mỗi 30 phút, không hard-code
const buildTimeOptions = () => {
  const result = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = h.toString().padStart(2, "0");
      const mm = m.toString().padStart(2, "0");
      result.push(`${hh}:${mm}`);
    }
  }
  return result;
};

export default function RestaurantSearchCard({ onSubmit }) {
  // ---- Địa điểm: dùng DestinationTypeahead như HotelSearchCard ----
  const [dest, setDest] = useState({ text: "", slug: null });

  // ---- Ngày dùng bữa: 1 ngày, dùng MravelDatePicker ----
  const [date, setDate] = useState(() => new Date());

  // ---- Giờ: dropdown custom (string "HH:mm") ----
  const timeOptions = useMemo(buildTimeOptions, []);
  const [time, setTime] = useState(""); // lưu "HH:mm"
  const [openTime, setOpenTime] = useState(false);
  const timeBoxRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (timeBoxRef.current && !timeBoxRef.current.contains(e.target)) {
        setOpenTime(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const [people, setPeople] = useState(2);
  const [cuisine, setCuisine] = useState("");

  const submit = (e) => {
    e?.preventDefault?.();

    onSubmit?.({
      location: dest.slug || dest.text,
      date: formatDate(date),
      time, // đã là string "HH:mm"
      people,
      cuisine,
    });
  };

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-white shadow-[0_14px_40px_rgba(15,23,42,0.18)] border border-gray-100">
      {/* Header nhỏ */}
      <div className="px-6 pt-5 pb-3 border-b border-gray-100">
        <h2 className="text-base md:text-lg font-semibold text-gray-900">
          Đặt bàn nhà hàng cho chuyến đi
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Chọn khu vực, ngày và số người để tìm quán phù hợp.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={submit}
        className="px-6 pb-5 pt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
      >
        {/* Khu vực / Thành phố – DestinationTypeahead, không icon map nữa */}
        <div className="col-span-1 md:col-span-6">
          <div className="text-xs font-semibold text-gray-700 mb-1.5">
            Khu vực / Thành phố
          </div>
          <div className="flex items-center h-11 border rounded-xl px-3 bg-white">
            <DestinationTypeahead
              label={null}
              placeholder="Thành phố, nhà hàng, điểm đến"
              onSubmit={({ text, slug }) => setDest({ text, slug })}
              className="flex-1 min-w-0 w-full !max-w-none !mx-0"
              buttonSlot={null}
            />
          </div>
        </div>

        {/* Ngày dùng bữa – 1 ngày, MravelDatePicker */}
        <div className="col-span-1 md:col-span-3">
          <div className="text-xs font-semibold text-gray-700 mb-1.5">
            Ngày dùng bữa
          </div>
          <div className="flex items-center h-11 border rounded-xl px-3 bg-white">
            <FaCalendarAlt className="text-gray-400 mr-2" />
            <MravelDatePicker
              selected={date}
              onChange={setDate}
              className="w-full bg-transparent outline-none text-sm text-gray-800 cursor-pointer"
            />
          </div>
        </div>

        {/* Giờ – dropdown custom, luôn xổ ngay dưới ô Giờ */}
        <div className="col-span-1 md:col-span-3">
          <div className="text-xs font-semibold text-gray-700 mb-1.5">Giờ</div>
          <div
            ref={timeBoxRef}
            className="relative flex items-center h-11 border rounded-xl px-3 bg-white cursor-pointer"
            onClick={() => setOpenTime((v) => !v)}
          >
            <FaClock className="text-gray-400 mr-2" />
            <span
              className={`text-sm ${
                time ? "text-gray-800" : "text-gray-400"
              }`}
            >
              {time || "Chọn giờ"}
            </span>
            <span className="ml-auto text-gray-400">▾</span>

            {openTime && (
              <div
                className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-xl border border-gray-200 bg-white shadow-xl max-h-64 overflow-y-auto py-2"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="px-3 pb-1 text-xs font-semibold text-gray-500">
                  Giờ (theo giờ địa phương)
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
                      e.stopPropagation();      // ⬅ chặn bubble lên div cha
                      setTime(t);
                      setOpenTime(false);       // chọn xong thì đóng dropdown
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Số người (giữ nguyên) */}
        <div className="col-span-1 md:col-span-3">
          <div className="text-xs font-semibold text-gray-700 mb-1.5">
            Số người
          </div>
          <div className="flex items-center h-11 border rounded-xl px-3 bg-white">
            <FaUsers className="text-gray-400 mr-2" />
            <input
              type="number"
              min={1}
              max={20}
              value={people}
              onChange={(e) =>
                setPeople(Math.max(1, Number(e.target.value) || 1))
              }
              className="w-full bg-transparent outline-none text-sm text-gray-800"
            />
          </div>
        </div>

        {/* Loại ẩm thực (giữ nguyên) */}
        <div className="col-span-1 md:col-span-5">
          <div className="text-xs font-semibold text-gray-700 mb-1.5">
            Loại ẩm thực
          </div>
          <div className="flex items-center h-11 border rounded-xl px-3 bg-white">
            <FaUtensils className="text-gray-400 mr-2" />
            <input
              type="text"
              value={cuisine}
              onChange={(e) => setCuisine(e.target.value)}
              placeholder="Việt, Nhật, BBQ…"
              className="w-full bg-transparent outline-none text-sm text-gray-800"
            />
          </div>
        </div>

        {/* Nút tìm kiếm (giữ nguyên) */}
        <div className="col-span-1 md:col-span-4 flex items-end">
          <Button
            type="submit"
            className="w-full h-11 rounded-xl bg-[#ff6a00] hover:bg-[#ff5a00] text-white font-semibold text-sm md:text-base inline-flex items-center justify-center gap-2"
          >
            <FaSearch />
            Tìm quán ăn
          </Button>
        </div>
      </form>
    </div>
  );
}