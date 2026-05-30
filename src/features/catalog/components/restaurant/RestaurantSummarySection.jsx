// src/features/catalog/components/restaurant/RestaurantSummarySection.jsx
import React from "react";
import { useTranslation } from "react-i18next";
import i18n from "../../../../i18n";

/*  UI bits  */
const SectionTitle = ({ children }) => (
  <h3 className="mt-5 first:mt-0 font-semibold text-gray-900 dark:text-gray-100">{children}</h3>
);
const Bullet = ({ children }) => <li className="leading-relaxed">- {children}</li>;

/*  Helpers: ép dữ liệu về text  */
const toText = (v) => {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "object") {
    // phổ biến: {label}, {name}, {title}, {code}
    return v.label ?? v.name ?? v.title ?? v.code ?? "";
  }
  return String(v);
};
const listToLine = (arr) =>
  Array.isArray(arr) ? arr.map(toText).filter(Boolean).join(", ") : "";

/*  Extractors từ RestaurantDoc  */
const getSuitabilities = (r) => r?.suitableFor ?? [];
const getSpecialties = (r) => r?.signatureDishes ?? [];
const getAmbience = (r) => r?.ambience ?? [];
const getCapacity = (r) =>
  r?.capacity?.totalCapacity ?? r?.capacity ?? null;

const money = (n) =>
  typeof n === "number"
    ? n.toLocaleString("vi-VN") + "đ"
    : (n && Number(n) === +n)
    ? Number(n).toLocaleString("vi-VN") + "đ"
    : i18n.t("restaurant.has_fee");

/** fee label theo ParkingFeeType + amount */
const feeLabel = (feeType, amount) => {
  if (!feeType) return "";
  const t = String(feeType).toUpperCase();
  if (t === "FREE") return i18n.t("restaurant.free");
  if (amount != null) return money(amount);
  return i18n.t("restaurant.has_fee");
};

const getParkingLines = (r) => {
  const p = r?.parking || {};
  const lines = [];

  // Xe máy
  if (p.hasMotorbikeParking === false) {
    lines.push(i18n.t("restaurant.motorbike_parking_none"));
  } else if (p.hasMotorbikeParking) {
    const fee = feeLabel(p.motorbikeParkingFeeType, p.motorbikeParkingFeeAmount);
    const note = p.notes ? ", " + p.notes : "";
    lines.push(i18n.t("restaurant.motorbike_parking_available", { note, fee }));
  }

  // Xe ô tô
  if (p.hasCarParking === false) {
    lines.push(i18n.t("restaurant.car_parking_none"));
  } else if (p.hasCarParking) {
    const fee = feeLabel(p.carParkingFeeType, p.carParkingFeeAmount);
    const note = p.notes ? ", " + p.notes : "";
    lines.push(i18n.t("restaurant.car_parking_available", { note, fee }));
  }

  return lines;
};

/** Lấy các đoạn “Điểm đặc trưng” trong content OVERVIEW */
const getHighlights = (r) => {
  const blocks = Array.isArray(r?.content) ? r.content : [];

  const isOverview = (b) => {
    const sec = b?.section ?? b?.contentSection ?? b?.sectionCode;
    return String(sec).toUpperCase().includes("OVERVIEW");
  };
  const isParagraph = (b) => String(b?.type).toUpperCase().includes("PARAGRAPH");

  // Lấy TẤT CẢ paragraph trong OVERVIEW (bao gồm 2 đoạn mở đầu + các đoạn sau heading "Điểm đặc trưng")
  const paras = blocks
    .filter((b) => isOverview(b) && isParagraph(b))
    .map((b) => toText(b?.text ?? b?.content ?? b?.body))
    .filter(Boolean);

  return paras;
};

export default function RestaurantSummarySection({ restaurant }) {
  const { t } = useTranslation();
  if (!restaurant) return null;

  const suitabilities = getSuitabilities(restaurant);
  const specialties = getSpecialties(restaurant);
  const ambience = getAmbience(restaurant);
  const capacity = getCapacity(restaurant);
  const parkingLines = getParkingLines(restaurant);
  const highlights = getHighlights(restaurant);

  return (
    <section className="px-5 md:px-6 pt-5 pb-6">
      <h2 className="text-2xl md:text-[26px] font-extrabold text-gray-900 dark:text-gray-100">
        {t("restaurant.summary_title", { name: restaurant?.name || restaurant?.slug || t("restaurant.restaurant_fallback") })}
      </h2>

      <div className="mt-5 text-gray-800 dark:text-gray-200 text-[15px] md:text-base">
        {/* Phù hợp */}
        <SectionTitle>{t("restaurant.suitable_for")}</SectionTitle>
        <ul className="mt-2 space-y-1">
          <Bullet>{listToLine(suitabilities)}...</Bullet>
        </ul>

        {/* Món đặc sắc */}
        <SectionTitle>{t("restaurant.signature_dishes")}</SectionTitle>
        <ul className="mt-2 space-y-1">
          <Bullet>{listToLine(specialties)}...</Bullet>
        </ul>

        {/* Không gian */}
        <SectionTitle>{t("restaurant.ambience")}</SectionTitle>
        <ul className="mt-2 space-y-1">
          <Bullet>{listToLine(ambience)}</Bullet>
          {capacity != null && (
            <Bullet>
              {t("restaurant.capacity_label")} <span className="font-semibold">{t("restaurant.capacity_guests", { count: capacity })}</span>
            </Bullet>
          )}
        </ul>

        {/* Chỗ Để Xe */}
        <SectionTitle>{t("restaurant.parking")}</SectionTitle>
        <ul className="mt-2 space-y-1">
          {parkingLines.map((t, i) => (
            <Bullet key={i}>{t}</Bullet>
          ))}
        </ul>

        {/* Điểm đặc trưng (lấy từ content OVERVIEW → sau heading “Điểm đặc trưng”) */}
        {highlights.length > 0 && (
          <>
            <SectionTitle>{t("restaurant.highlights")}</SectionTitle>
            <ul className="mt-2 space-y-2">
              {highlights.map((p, i) => (
                <Bullet key={i}>{p}</Bullet>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}