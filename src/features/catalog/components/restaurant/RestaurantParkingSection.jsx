// src/features/catalog/components/restaurant/RestaurantParkingSection.jsx
import React from "react";

function formatVND(n) {
  if (n == null) return null;
  try {
    return new Intl.NumberFormat("vi-VN").format(Number(n));
  } catch {
    return `${n}`;
  }
}

function feeText(type, amount) {
  if (!type) return "Không rõ";
  if (type === "FREE") return "Miễn phí";
  if (type === "PAID") return amount != null ? `${formatVND(amount)}đ` : "Có thu phí";
  return "Không rõ";
}

export default function RestaurantParkingSection({ restaurant }) {
  const p = restaurant?.parking;
  if (!p) return null;

  return (
    <section className="px-4 md:px-5 pt-3 pb-4">
      <h1 className="text-xl md:text-2xl font-extrabold text-gray-900">Để xe</h1>

      <div className="mt-3 rounded-xl bg-white shadow-sm p-4 md:p-4 leading-relaxed text-gray-900">
        <div className="space-y-1">
          <h3 className="font-bold text-base md:text-lg">1. Chỗ đỗ ô tô</h3>
          {p.hasCarParking ? (
            <>
              <p>
                - Nơi đỗ: <span className="font-semibold">{p.carParkingLocation || "Tại nhà hàng"}</span>.
              </p>
              <p>
                - Phí trông giữ xe:{" "}
                <span className="font-semibold">
                  {feeText(p.carParkingFeeType, p.carParkingFeeAmount)}
                </span>
              </p>
            </>
          ) : (
            <p>- Không có chỗ đỗ ô tô.</p>
          )}
        </div>

        <div className="space-y-1 mt-4">
          <h3 className="font-bold text-base md:text-lg">2. Chỗ đỗ xe máy</h3>
          {p.hasMotorbikeParking ? (
            <>
              <p>
                - Nơi đỗ: <span className="font-semibold">{p.motorbikeParkingLocation || "Tại nhà hàng"}</span>.
              </p>
              <p>
                - Phí trông giữ xe:{" "}
                <span className="font-semibold">
                  {feeText(p.motorbikeParkingFeeType, p.motorbikeParkingFeeAmount)}
                </span>
              </p>
            </>
          ) : (
            <p>- Không có chỗ đỗ xe máy.</p>
          )}
        </div>

        {p.notes && <p className="mt-4 italic text-gray-700">* {p.notes}</p>}
      </div>
    </section>
  );
}