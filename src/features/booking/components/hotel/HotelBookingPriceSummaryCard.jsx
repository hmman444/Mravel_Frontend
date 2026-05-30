// src/features/booking/components/hotel/HotelBookingPriceSummaryCard.jsx
import { useState, useMemo } from "react";
import { Tag } from "lucide-react";
import { useTranslation } from "react-i18next";

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
  paymentType,
  onPay,
  disabled = false,
  loading = false,
}) {
  const { t } = useTranslation();
  const [paymentOption, setPaymentOption] = useState("FULL"); // FULL | DEPOSIT

  const isPayAtHotel = paymentType === "PAY_AT_HOTEL";

  // Hiển thị: tối thiểu 1 đêm
  const displayNights =
    typeof nights === "number" && nights > 0 ? nights : 1;

  // = BASE AMOUNTS (FULL) =
  const baseRoom = safeNumber(roomPrice);
  const baseTax = safeNumber(taxAndFee);
  const baseFinal = safeNumber(finalTotal ?? baseRoom + baseTax);
  const baseOriginal = safeNumber(originalTotal ?? baseFinal);

  // = FACTOR THEO HÌNH THỨC THANH TOÁN =
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
    if (!isPayAtHotel) return t("booking.pay_full");
    return paymentOption === "DEPOSIT"
      ? t("booking.deposit_percent", { percent: DEPOSIT_PERCENT })
      : t("booking.pay_full");
  }, [isPayAtHotel, paymentOption, t]);

  return (
    <section className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 px-4 py-3 md:px-5">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 md:text-base">
            {t("booking.price_details")}
          </h2>
        </div>

        {/* 🔽 Dropdown hình thức thanh toán (chỉ hiển thị nếu PAY_AT_HOTEL) */}
        {isPayAtHotel ? (
          <div className="flex items-center gap-2">
            <select
              value={paymentOption}
              onChange={(e) => setPaymentOption(e.target.value)}
              className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1 text-[11px] text-gray-700 dark:text-gray-300 outline-none hover:border-blue-500 focus:border-blue-500 md:text-xs"
            >
              <option value="FULL">{t("booking.pay_full")}</option>
              <option value="DEPOSIT">
                {t("booking.deposit_pay_rest_at_hotel", { percent: DEPOSIT_PERCENT })}
              </option>
            </select>
          </div>
        ) : (
          <span className="text-[11px] text-gray-500 dark:text-gray-400">
            {t("booking.payment_method_full")}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="space-y-3 px-4 pb-4 pt-3 md:px-5 md:pb-5">
        <div className="space-y-2 text-xs text-gray-800 dark:text-gray-200 md:text-sm">
          <div className="flex items-center justify-between">
            <span>{t("booking.room_price")}</span>
            <span>{formattedRoom} VND</span>
          </div>
          <div className="flex items-center justify-between text-gray-600 dark:text-gray-400">
            <span>
              {t("booking.room_line_summary", { count: roomsCount, roomName, nights: displayNights })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>{t("booking.tax_and_fee")}</span>
            <span>{formattedTax} VND</span>
          </div>
        </div>

        {/* Tổng cộng */}
        <div className="mt-2 space-y-1 border-t border-dashed border-gray-200 dark:border-gray-700 pt-3">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 md:text-sm">
            {hasSaving ? (
              <>
                <span className="line-through">{formattedOriginal} VND</span>
                <span className="text-[11px] font-semibold text-green-600">
                  {t("booking.saving_amount", { amount: savingAmount })}
                </span>
              </>
            ) : (
              <span>{formattedOriginal} VND</span>
            )}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 md:text-sm">{t("booking.total_with_label", { label: paymentLabel })}</p>
              <p className="text-lg font-bold text-emerald-600 md:text-xl">
                {formattedFinal} VND
              </p>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {t("booking.rooms_nights_tax_included", { rooms: roomsCount, nights: displayNights })}
              </p>
              {isPayAtHotel && paymentOption === "DEPOSIT" && (
                <p className="mt-0.5 text-[11px] text-orange-600">
                  {t("booking.deposit_note", { percent: DEPOSIT_PERCENT, amount: formattedFinal })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Button */}
        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => onPay?.({ paymentOption })}
          className={[
            "mt-3 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition",
            disabled || loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#007bff] hover:bg-[#ff6b1a]",
          ].join(" ")}
        >
          {loading ? t("booking.redirecting_to_momo") : t("booking.pay")}
        </button>

        <p className="mt-2 text-[11px] leading-snug text-gray-500 dark:text-gray-400">
          {t("booking.terms_agree_prefix")}{" "}
          <span className="cursor-pointer text-blue-600 hover:underline">
            {t("booking.terms_and_conditions")}
          </span>
          ,{" "}
          <span className="cursor-pointer text-blue-600 hover:underline">
            {t("booking.privacy_policy")}
          </span>{" "}
          {t("booking.terms_and")}{" "}
          <span className="cursor-pointer text-blue-600 hover:underline">
            {t("booking.stay_refund_process")}
          </span>{" "}
          {t("booking.terms_agree_suffix")}
        </p>
      </div>
    </section>
  );
}