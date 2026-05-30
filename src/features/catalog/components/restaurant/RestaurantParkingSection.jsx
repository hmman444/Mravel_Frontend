// src/features/catalog/components/restaurant/RestaurantParkingSection.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../../../i18n";

function formatVND(n) {
  if (n == null) return null;
  try {
    return new Intl.NumberFormat("vi-VN").format(Number(n));
  } catch {
    return `${n}`;
  }
}

function feeText(type, amount) {
  if (!type) return i18n.t("restaurant.parking_unknown");
  if (type === "FREE") return i18n.t("restaurant.parking_free");
  if (type === "PAID") return amount != null ? `${formatVND(amount)}đ` : i18n.t("restaurant.parking_has_fee");
  return i18n.t("restaurant.parking_unknown");
}

export default function RestaurantParkingSection({ restaurant }) {
  const { t } = useTranslation();
  const p = restaurant?.parking;
  if (!p) return null;

  return (
    <section className="px-4 md:px-5 pt-3 pb-4">
      <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 dark:text-gray-100">{t("restaurant.parking_title")}</h1>

      <div className="mt-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm p-4 md:p-4 leading-relaxed text-gray-900 dark:text-gray-100">
        <div className="space-y-1">
          <h3 className="font-bold text-base md:text-lg">{t("restaurant.parking_car_heading")}</h3>
          {p.hasCarParking ? (
            <>
              <p>
                - {t("restaurant.parking_location_label")}: <span className="font-semibold">{p.carParkingLocation || t("restaurant.parking_at_restaurant")}</span>.
              </p>
              <p>
                - {t("restaurant.parking_fee_label")}:{" "}
                <span className="font-semibold">
                  {feeText(p.carParkingFeeType, p.carParkingFeeAmount)}
                </span>
              </p>
            </>
          ) : (
            <p>- {t("restaurant.parking_no_car")}</p>
          )}
        </div>

        <div className="space-y-1 mt-4">
          <h3 className="font-bold text-base md:text-lg">{t("restaurant.parking_motorbike_heading")}</h3>
          {p.hasMotorbikeParking ? (
            <>
              <p>
                - {t("restaurant.parking_location_label")}: <span className="font-semibold">{p.motorbikeParkingLocation || t("restaurant.parking_at_restaurant")}</span>.
              </p>
              <p>
                - {t("restaurant.parking_fee_label")}:{" "}
                <span className="font-semibold">
                  {feeText(p.motorbikeParkingFeeType, p.motorbikeParkingFeeAmount)}
                </span>
              </p>
            </>
          ) : (
            <p>- {t("restaurant.parking_no_motorbike")}</p>
          )}
        </div>

        {p.notes && <p className="mt-4 italic text-gray-700 dark:text-gray-300">* {p.notes}</p>}
      </div>
    </section>
  );
}