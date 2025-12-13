// src/features/booking/components/hotel/HotelBookingForm.jsx
import { useMemo, useState } from "react";
import { Phone, Mail } from "lucide-react";
import HotelStayDateRangePicker from "./HotelStayDateRangePicker";
import "../../../../styles/datepicker.css";
import "react-datepicker/dist/react-datepicker.css";

const MS_PER_DAY = 1000 * 60 * 60 * 24;

export default function HotelBookingForm({
  defaultName = "",
  defaultEmail = "",
  checkIn,
  checkOut,
  nights,
  roomsCount = 1,
  onStayChange,   // ({ checkIn, checkOut, nights })
  onRoomsChange,  // (roomsCount)
}) {
  const [contactName, setContactName] = useState(defaultName);
  const [contactPhone, setContactPhone] = useState("");
  const [contactEmail, setContactEmail] = useState(defaultEmail);
  const [nameError, setNameError] = useState("");
  const NOTE_MAX = 200;
  const [note, setNote] = useState("");

  const handleNameBlur = () => {
    if (!contactName.trim()) {
      setNameError("Vui lòng nhập họ tên.");
      return;
    }
    const nameRegex = /^[A-Za-zÀ-ỹ\s]+$/;
    if (!nameRegex.test(contactName.trim())) {
      setNameError("Rất tiếc, vui lòng chỉ nhập chữ (a-z).");
    } else {
      setNameError("");
    }
  };

  // Tính số ngày hiển thị từ checkIn/checkOut:
  // 15–15 => 1 ngày
  // 15–16 => 2 ngày
  // 15–17 => 3 ngày
  const stayDays = useMemo(() => {
    if (!checkIn || !checkOut) return 0;

    const s = new Date(checkIn);
    const e = new Date(checkOut);
    s.setHours(0, 0, 0, 0);
    e.setHours(0, 0, 0, 0);

    let diffDays = (e.getTime() - s.getTime()) / MS_PER_DAY;
    if (diffDays < 0) diffDays = 0;
    diffDays = Math.round(diffDays);

    return diffDays === 0 ? 1 : diffDays + 1;
  }, [checkIn, checkOut]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm md:p-5 space-y-5">
      {/* HEADER */}
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-50 text-blue-600">
          <Mail className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-gray-900 md:text-base">
            Liên hệ đặt chỗ
          </h2>
          <p className="text-xs text-gray-500 md:text-sm">
            Thêm liên hệ để nhận xác nhận đặt chỗ.
          </p>
        </div>
      </div>

      {/* FORM INPUTS */}
      <div className="space-y-4">
        {/* Họ tên */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-800 md:text-sm">
            Họ tên <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            onBlur={handleNameBlur}
            className={[
              "w-full rounded-lg border px-3 py-2 text-sm md:text-base outline-none",
              nameError
                ? "border-red-400 focus:border-red-500"
                : "border-gray-300 focus:border-blue-500",
              "transition",
            ].join(" ")}
            placeholder="Ví dụ: Nguyễn Văn A"
          />
          {nameError && (
            <p className="mt-1 text-xs text-red-500">{nameError}</p>
          )}
        </div>

        {/* Phone + Email */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Phone */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-800 md:text-sm">
              Số điện thoại <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center rounded-lg border border-gray-300 bg-white px-3 focus-within:border-blue-500">
              <Phone className="mr-2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="h-9 w-full border-none bg-transparent text-sm outline-none md:h-10"
                placeholder="VD: 0901234567"
              />
            </div>
            <p className="mt-1 text-[11px] text-gray-500">
              Vui lòng nhập số điện thoại di động tại Việt Nam.
            </p>
          </div>

          {/* Email */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-800 md:text-sm">
              Email <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center rounded-lg border border-gray-300 bg-white px-3 focus-within:border-blue-500">
              <Mail className="mr-2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="h-9 w-full border-none bg-transparent text-sm outline-none md:h-10"
                placeholder="email@example.com"
              />
            </div>
          </div>
        </div>

        {/* RANGE DATE PICKER + SỐ PHÒNG */}
        <div className="space-y-1">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            {/* Thời gian lưu trú (thu hẹp) */}
            <div className="flex-1 min-w-0">
              <div className="mb-1 text-[13px] font-semibold text-gray-700">
                Thời gian lưu trú
              </div>
              <HotelStayDateRangePicker
                checkIn={checkIn}
                checkOut={checkOut}
                onChange={onStayChange}
              />
            </div>

            {/* Số phòng */}
            <div className="w-full md:w-36">
              <label className="mb-1 block text-[13px] font-semibold text-gray-700">
                Số phòng
              </label>

              <div className="flex items-center rounded-lg border border-gray-300 bg-white">
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={roomsCount}
                  onChange={(e) => {
                    let v = parseInt(e.target.value, 10);
                    if (Number.isNaN(v)) return;
                    if (v < 1) v = 1;
                    if (v > 20) v = 20;
                    onRoomsChange(v);
                  }}
                  className="w-full text-center border-x border-gray-200 h-10 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <p className="mt-1 text-[11px] text-gray-500">
            Ngày nhận và trả phòng sẽ được gửi kèm trong thông tin đặt chỗ của
            bạn.
          </p>
          {nights > 0 && stayDays > 0 && (
            <p className="mt-0.5 text-[11px] text-gray-500">
              Bạn đã chọn {stayDays} ngày {nights} đêm.
            </p>
          )}
        </div>

        {/* GHI CHÚ */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-gray-800 md:text-sm">
            Ghi chú (tối đa {NOTE_MAX} ký tự)
          </label>

          <textarea
            value={note}
            maxLength={NOTE_MAX}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            className={[
              "w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2",
              "text-sm md:text-base outline-none focus:border-blue-500",
              "transition",
              note.length >= NOTE_MAX ? "border-orange-400 focus:border-orange-500" : "",
            ].join(" ")}
            placeholder="Ví dụ: Nhận phòng muộn, yêu cầu dọn vệ sinh trước, cần hóa đơn VAT..."
          />

          <div className="mt-1 flex items-center justify-between">
            <p className="text-[11px] text-gray-500">
              Ghi chú này sẽ được gửi kèm cho khách sạn (không đảm bảo đáp ứng).
            </p>
            <span className="text-[11px] text-gray-500">
              {note.length}/{NOTE_MAX}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}