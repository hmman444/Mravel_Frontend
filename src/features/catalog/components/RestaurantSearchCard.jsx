// src/features/restaurants/components/RestaurantSearchCard.jsx
import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaClock,
  FaUsers,
  FaSearch,
  FaUtensils,
} from "react-icons/fa";
import Button from "../../../components/Button";

const formatDate = (d) =>
  d ? new Date(d).toISOString().slice(0, 10) : "";

// các khung giờ phổ biến
const TIME_OPTIONS = [
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
  "19:30",
  "20:00",
  "20:30",
  "21:00",
];

export default function RestaurantSearchCard({ onSubmit }) {
  const [location, setLocation] = useState("");

  // ===== range date giống Traveloka =====
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;

  const [time, setTime] = useState("");
  const [people, setPeople] = useState(2);
  const [cuisine, setCuisine] = useState("");

  const submit = (e) => {
    e?.preventDefault?.();

    onSubmit?.({
      location,
      // giữ lại cả 2 ngày để xử lý như “khởi hành” / “kết thúc”
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      // nếu ở chỗ khác đang dùng field date cũ thì có thể map tạm:
      date: formatDate(startDate),
      time,
      people,
      cuisine,
    });
  };

  // text hiển thị trên input (range)
  const dateDisplay = startDate && endDate
    ? `${startDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      })} - ${endDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      })}`
    : "";

  return (
    <div className="w-full max-w-5xl mx-auto rounded-3xl bg-white shadow-[0_14px_40px_rgba(15,23,42,0.18)] border border-gray-100">
      {/* Header nhỏ */}
      <div className="px-6 pt-5 pb-3 border-b border-gray-100">
        <h2 className="text-base md:text-lg font-semibold text-gray-900">
          Đặt bàn nhà hàng cho chuyến đi
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Chọn khu vực, khoảng ngày và số người để tìm quán phù hợp.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={submit}
        className="px-6 pb-5 pt-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-end"
      >
        {/* Khu vực / Thành phố */}
        <div className="col-span-1 md:col-span-6">
          <div className="text-xs font-semibold text-gray-700 mb-1.5">
            Khu vực / Thành phố
          </div>
          <div className="flex items-center h-11 border rounded-xl px-3 bg-white">
            <FaMapMarkerAlt className="text-gray-400 mr-2" />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="TP.HCM, Hà Nội…"
              className="w-full outline-none bg-transparent text-sm text-gray-800"
            />
          </div>
        </div>

        {/* Ngày dùng bữa – kiểu Traveloka: 2 tháng + range */}
        <div className="col-span-1 md:col-span-3">
          <div className="text-xs font-semibold text-gray-700 mb-1.5">
            Khoảng ngày
          </div>
          <div className="flex items-center h-11 border rounded-xl px-3 bg-white">
            <FaCalendarAlt className="text-gray-400 mr-2" />
            <DatePicker
              selectsRange
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => {
                setDateRange(update);
              }}
              minDate={new Date()}
              monthsShown={2}
              placeholderText="Chọn khoảng ngày"
              dateFormat="dd/MM"
              // hiển thị range gọn gàng như "16/11 - 20/11"
              value={dateDisplay}
              className="w-full bg-transparent outline-none text-sm text-gray-800 cursor-pointer"
              // header custom có nút < > ở 2 bên
              renderCustomHeader={({
                monthDate,
                customHeaderCount,
                decreaseMonth,
                increaseMonth,
              }) => (
                <div className="flex items-center justify-between px-3 py-2">
                  {customHeaderCount === 0 ? (
                    <button
                      type="button"
                      onClick={decreaseMonth}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      ‹
                    </button>
                  ) : (
                    <span className="w-6" />
                  )}

                  <span className="text-sm font-semibold text-gray-800 capitalize">
                    {monthDate.toLocaleString("vi-VN", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>

                  {customHeaderCount === 1 ? (
                    <button
                      type="button"
                      onClick={increaseMonth}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      ›
                    </button>
                  ) : (
                    <span className="w-6" />
                  )}
                </div>
              )}
            />
          </div>
        </div>

        {/* Giờ */}
        <div className="col-span-1 md:col-span-3">
          <div className="text-xs font-semibold text-gray-700 mb-1.5">
            Giờ
          </div>
          <div className="flex items-center h-11 border rounded-xl px-3 bg-white">
            <FaClock className="text-gray-400 mr-2" />
            <select
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-transparent outline-none text-sm text-gray-800 cursor-pointer"
            >
              <option value="">Chọn giờ</option>
              {TIME_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Số người */}
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

        {/* Loại ẩm thực */}
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

        {/* Nút tìm kiếm */}
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