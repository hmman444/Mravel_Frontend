// src/features/catalog/components/restaurant/RestaurantPolicySection.jsx
import React, { useMemo } from "react";

function formatVND(n) {
  if (n == null) return null;
  try {
    return new Intl.NumberFormat("vi-VN").format(Number(n));
  } catch {
    return `${n}`;
  }
}

function minuteText(m) {
  if (!m && m !== 0) return null;
  return `${m} phút`;
}

function groupBlackoutDays(blackoutRules = []) {
  const byMonth = new Map();
  blackoutRules.forEach((r) => {
    const m = r?.month;
    const d = r?.day;
    if (!m || !d) return;
    if (!byMonth.has(m)) byMonth.set(m, new Set());
    byMonth.get(m).add(d);
  });

  const entries = [...byMonth.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([month, daysSet]) => {
      const days = [...daysSet].sort((a, b) => a - b);
      const dayStr =
        days.length === 1 ? `Ngày ${days[0]}` : `Ngày ${days.join(", ")}`;
      return { month, dayStr };
    });

  return entries;
}

export default function RestaurantPolicySection({ restaurant }) {
  const policy = restaurant?.policy;
  const blackoutByMonth = useMemo(
    () => groupBlackoutDays(policy?.blackoutRules ?? []),
    [policy?.blackoutRules]
  );

  if (!policy) return null;

  const depositLine =
    policy.depositRequired && policy.depositAmount
      ? `Với booking từ ${policy.depositMinGuests || 0} khách trở lên và các booking yêu cầu đặc biệt về decoration, vui lòng đặt cọc trước: ${formatVND(policy.depositAmount)}vnđ`
      : null;

  const invoiceVat =
    policy.vatInvoiceAvailable === true
      ? "Nhà hàng có xuất hóa đơn VAT, chỉ khi khách hàng yêu cầu. Mức phí VAT theo quy định của pháp luật Việt Nam."
      : "Nhà hàng không xuất hóa đơn VAT.";

  const invoiceDirect =
    policy.directInvoiceAvailable === true
      ? "Nhà hàng có xuất hóa đơn trực tiếp."
      : "Nhà hàng không xuất hóa đơn trực tiếp.";

  const allowFood =
    policy.allowOutsideFood === true
      ? "ĐƯỢC mang thức ăn từ ngoài vào."
      : "KHÔNG được mang thức ăn từ ngoài vào.";

  const allowDrink =
    policy.allowOutsideDrink === true
      ? "ĐƯỢC PHÉP mang vào và có tính phụ phí như sau:"
      : "KHÔNG được mang đồ uống từ ngoài vào.";

  return (
    <section className="px-5 md:px-6 pt-5 pb-6">
      <h2 className="text-2xl md:text-[26px] font-extrabold text-gray-900">
        Quy định
      </h2>

      <div className="mt-4 rounded-2xl bg-white shadow-sm p-5 md:p-6 leading-relaxed text-gray-900">
        <div className="space-y-6">
          <div>
            <h3 className="font-bold text-lg">1. Quy định về đặt cọc:</h3>
            {depositLine && <p className="mt-2">- {depositLine}</p>}
          </div>

          <div>
            <h3 className="font-bold text-lg">
              2. Quy định về ưu đãi: <span className="font-bold">Có</span>, cụ thể như sau:
            </h3>
            <div className="mt-2 space-y-2">
              <p>
                - Ưu đãi <span className="font-bold">KHÔNG</span> được áp dụng vào các ngày lễ, tết sau:{" "}
                {blackoutByMonth.length > 0 ? (
                  <span className="text-red-600 font-semibold">
                    {blackoutByMonth
                      .map((x) => `Tháng ${x.month} (${x.dayStr})`)
                      .join(", ")}
                  </span>
                ) : (
                  " (không có dữ liệu ngày chặn)"
                )}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg">3. Quy định về thời gian nhận khách PasGo</h3>
            <p className="mt-2">- Nhà hàng luôn nhận khách PasGo.</p>
          </div>

          <div>
            <h3 className="font-bold text-lg">
              4. Quy định về Thời gian đặt chỗ trước: <span className="font-bold">Có</span>, cụ thể như sau:
            </h3>
            {policy.minBookingLeadTimeMinutes != null && (
              <p className="mt-2">
                - Thời gian đặt chỗ trước tối thiểu:{" "}
                <span className="font-semibold">{minuteText(policy.minBookingLeadTimeMinutes)}.</span>
              </p>
            )}
          </div>

          <div>
            <h3 className="font-bold text-lg">
              5. Quy định về Thời gian giữ chỗ tối đa: <span className="font-bold">Có</span>, cụ thể như sau:
            </h3>
            {policy.maxHoldTimeMinutes != null && (
              <p className="mt-2">
                - Thời gian nhà hàng giữ chỗ tối đa:{" "}
                <span className="font-semibold">{minuteText(policy.maxHoldTimeMinutes)}.</span>
              </p>
            )}
          </div>

          <div>
            <h3 className="font-bold text-lg">6. Quy định về số khách tối thiểu trên mỗi lượt đặt bàn:</h3>
            <p className="mt-2">
              {policy.minGuestsPerBooking ? `- Tối thiểu ${policy.minGuestsPerBooking} khách.` : "- Không quy định"}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg">
              7. Quy định về Hoá đơn: <span className="font-bold">Có</span>, cụ thể như sau:
            </h3>
            <div className="mt-2 space-y-1">
              <p>- Hóa đơn VAT: {invoiceVat}</p>
              <p>- Hóa đơn trực tiếp: {invoiceDirect}</p>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-lg">8. Quy định về phí phục vụ:</h3>
            <p className="mt-2">
              {policy.serviceChargePercent ? `- Phí phục vụ: ${policy.serviceChargePercent}%` : "- Không quy định"}
            </p>
          </div>

          <div>
            <h3 className="font-bold text-lg">
              9. Quy định về phí mang đồ vào:{" "}
              <span className="font-bold">
                {policy.allowOutsideFood || policy.allowOutsideDrink ? "Có" : "Không"}
              </span>
              , cụ thể như sau:
            </h3>

            <div className="mt-2 space-y-2">
              <p>- Nhà hàng quy định {allowFood}</p>

              <div>
                <p>- Đối với đồ uống, {allowDrink}</p>
                {policy.allowOutsideDrink &&
                  Array.isArray(policy.outsideDrinkFees) &&
                  policy.outsideDrinkFees.length > 0 && (
                    <ul className="mt-1 ml-5 list-disc">
                      {policy.outsideDrinkFees.map((f, i) => {
                        const label =
                          f?.drinkType === "SPIRITS"
                            ? "Rượu mạnh"
                            : f?.drinkType === "WINE"
                            ? "Rượu vang"
                            : "Đồ uống";
                        return (
                          <li key={i}>
                            {label}: {formatVND(f?.feeAmount)}đ/chai
                          </li>
                        );
                      })}
                    </ul>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}