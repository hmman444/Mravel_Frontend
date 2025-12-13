// src/features/booking/components/hotel/HotelBookingPriceSummaryCard.jsx
import { useState, useMemo } from "react";
import { Tag } from "lucide-react";

const safeNumber = (v) =>
  typeof v === "number" && !Number.isNaN(v) ? v : 0;

const DEPOSIT_PERCENT = 30; // cọc 30%

export default function HotelBookingPriceSummaryCard({
  roomName = "Superior Double/twin",
  roomPrice = 0,
  taxAndFee = 0,
  originalTotal,
  finalTotal,
  nights = 1,
  roomsCount = 1,
  paymentType, // 👈 thêm prop này
}) {
  const [paymentOption, setPaymentOption] = useState("FULL"); // FULL | DEPOSIT

  const isPayAtHotel = paymentType === "PAY_AT_HOTEL";

  // ✅ Hiển thị: tối thiểu 1 đêm
  const displayNights =
    typeof nights === "number" && nights > 0 ? nights : 1;

  // ====== BASE AMOUNTS (FULL) ======
  const baseRoom = safeNumber(roomPrice);
  const baseTax = safeNumber(taxAndFee);
  const baseFinal = safeNumber(finalTotal ?? baseRoom + baseTax);
  const baseOriginal = safeNumber(originalTotal ?? baseFinal);

  // ====== FACTOR THEO HÌNH THỨC THANH TOÁN ======
  const factor =
    isPayAtHotel && paymentOption === "DEPOSIT"
      ? DEPOSIT_PERCENT / 100
      : 1;

  // 💰 Số tiền hiển thị sau khi áp factor
  const room = Math.round(baseRoom * factor);
  const tax = Math.round(baseTax * factor);
  const final = Math.round(baseFinal * factor);
  const original = Math.round(baseOriginal * factor);

  const formattedRoom = room.toLocaleString("vi-VN");
  const formattedTax = tax.toLocaleString("vi-VN");
  const formattedOriginal = original.toLocaleString("vi-VN");
  const formattedFinal = final.toLocaleString("vi-VN");

  const hasSaving = original > final;
  const savingAmount = hasSaving
    ? (original - final).toLocaleString("vi-VN")
    : null;

  const paymentLabel = useMemo(() => {
    if (!isPayAtHotel) return "Thanh toán toàn bộ";
    return paymentOption === "DEPOSIT"
      ? `Đặt cọc ${DEPOSIT_PERCENT}%`
      : "Thanh toán toàn bộ";
  }, [isPayAtHotel, paymentOption]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 md:px-5">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-gray-700" />
          <h2 className="text-sm font-semibold text-gray-900 md:text-base">
            Chi tiết giá
          </h2>
        </div>

        {/* 🔽 Dropdown hình thức thanh toán (chỉ hiển thị nếu PAY_AT_HOTEL) */}
        {isPayAtHotel ? (
          <div className="flex items-center gap-2">
            <select
              value={paymentOption}
              onChange={(e) => setPaymentOption(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-2 py-1 text-[11px] text-gray-700 outline-none hover:border-blue-500 focus:border-blue-500 md:text-xs"
            >
              <option value="FULL">Thanh toán toàn bộ</option>
              <option value="DEPOSIT">
                Đặt cọc {DEPOSIT_PERCENT}% – phần còn lại trả tại khách sạn
              </option>
            </select>
          </div>
        ) : (
          <span className="text-[11px] text-gray-500">
            Hình thức: Thanh toán toàn bộ
          </span>
        )}
      </div>

      {/* Body */}
      <div className="space-y-3 px-4 pb-4 pt-3 md:px-5 md:pb-5">
        <div className="space-y-2 text-xs text-gray-800 md:text-sm">
          <div className="flex items-center justify-between">
            <span>Giá phòng</span>
            <span>{formattedRoom} VND</span>
          </div>
          <div className="flex items-center justify-between text-gray-600">
            <span>
              ({roomsCount}x) {roomName} ({displayNights} đêm)
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Thuế và phí</span>
            <span>{formattedTax} VND</span>
          </div>
        </div>

        {/* Tổng cộng */}
        <div className="mt-2 space-y-1 border-t border-dashed border-gray-200 pt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 md:text-sm">
            {hasSaving ? (
              <>
                <span className="line-through">{formattedOriginal} VND</span>
                <span className="text-[11px] font-semibold text-green-600">
                  Tiết kiệm {savingAmount} VND
                </span>
              </>
            ) : (
              <span>{formattedOriginal} VND</span>
            )}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-600 md:text-sm">Tổng cộng ({paymentLabel})</p>
              <p className="text-lg font-bold text-emerald-600 md:text-xl">
                {formattedFinal} VND
              </p>
              <p className="text-[11px] text-gray-500">
                {roomsCount} phòng, {displayNights} đêm · Đã bao gồm thuế và phí
              </p>
              {isPayAtHotel && paymentOption === "DEPOSIT" && (
                <p className="mt-0.5 text-[11px] text-orange-600">
                  Bạn chỉ thanh toán trước {DEPOSIT_PERCENT}% ({formattedFinal} VND). 
                  Số tiền còn lại sẽ được thanh toán tại khách sạn.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Button */}
        <button
          type="button"
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl bg-[#007bff] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#ff6b1a]"
        >
          Thanh toán
        </button>

        <p className="mt-2 text-[11px] leading-snug text-gray-500">
          Bằng cách tiếp tục thanh toán, bạn đồng ý với{" "}
          <span className="cursor-pointer text-blue-600 hover:underline">
            Điều khoản &amp; Điều kiện
          </span>
          ,{" "}
          <span className="cursor-pointer text-blue-600 hover:underline">
            Chính sách Bảo mật
          </span>{" "}
          và{" "}
          <span className="cursor-pointer text-blue-600 hover:underline">
            Quy trình Hoàn tiền lưu trú
          </span>{" "}
          của Mravel.
        </p>
      </div>
    </section>
  );
}