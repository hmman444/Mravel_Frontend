// src/features/catalog/components/restaurant/RestaurantSummarySection.jsx
import React from "react";

/* ---------- UI bits ---------- */
const SectionTitle = ({ children }) => (
  <h3 className="mt-5 first:mt-0 font-semibold text-gray-900">{children}</h3>
);
const Bullet = ({ children }) => <li className="leading-relaxed">- {children}</li>;

/* ---------- Helpers: ép dữ liệu về text ---------- */
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

/* ---------- Extractors từ RestaurantDoc ---------- */
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
    : "Có phí";

/** fee label theo ParkingFeeType + amount */
const feeLabel = (feeType, amount) => {
  if (!feeType) return "";
  const t = String(feeType).toUpperCase();
  if (t === "FREE") return "Miễn phí";
  if (amount != null) return money(amount);
  return "Có phí";
};

const getParkingLines = (r) => {
  const p = r?.parking || {};
  const lines = [];

  // Xe máy
  if (p.hasMotorbikeParking === false) {
    lines.push("Xe máy: Không");
  } else if (p.hasMotorbikeParking) {
    const fee = feeLabel(p.motorbikeParkingFeeType, p.motorbikeParkingFeeAmount);
    const note = p.notes ? ", " + p.notes : "";
    lines.push(`Xe máy: Có${note} ( Mức phí: ${fee} )`);
  }

  // Xe ô tô
  if (p.hasCarParking === false) {
    lines.push("Xe ô tô: Không");
  } else if (p.hasCarParking) {
    const fee = feeLabel(p.carParkingFeeType, p.carParkingFeeAmount);
    const note = p.notes ? ", " + p.notes : "";
    lines.push(`Xe ô tô: Có${note} ( Mức phí: ${fee} )`);
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
  if (!restaurant) return null;

  const suitabilities = getSuitabilities(restaurant);
  const specialties = getSpecialties(restaurant);
  const ambience = getAmbience(restaurant);
  const capacity = getCapacity(restaurant);
  const parkingLines = getParkingLines(restaurant);
  const highlights = getHighlights(restaurant);

  return (
    <section className="px-5 md:px-6 pt-5 pb-6">
      <h2 className="text-2xl md:text-[26px] font-extrabold text-gray-900">
        Tóm tắt {restaurant?.name || restaurant?.slug || "nhà hàng"}
      </h2>

      <div className="mt-5 text-gray-800 text-[15px] md:text-base">
        {/* Phù hợp */}
        <SectionTitle>Phù hợp:</SectionTitle>
        <ul className="mt-2 space-y-1">
          <Bullet>{listToLine(suitabilities)}...</Bullet>
        </ul>

        {/* Món đặc sắc */}
        <SectionTitle>Món đặc sắc:</SectionTitle>
        <ul className="mt-2 space-y-1">
          <Bullet>{listToLine(specialties)}...</Bullet>
        </ul>

        {/* Không gian */}
        <SectionTitle>Không gian:</SectionTitle>
        <ul className="mt-2 space-y-1">
          <Bullet>{listToLine(ambience)}</Bullet>
          {capacity != null && (
            <Bullet>
              Sức chứa: <span className="font-semibold">{capacity} khách</span>
            </Bullet>
          )}
        </ul>

        {/* Chỗ Để Xe */}
        <SectionTitle>Chỗ Để Xe:</SectionTitle>
        <ul className="mt-2 space-y-1">
          {parkingLines.map((t, i) => (
            <Bullet key={i}>{t}</Bullet>
          ))}
        </ul>

        {/* Điểm đặc trưng (lấy từ content OVERVIEW → sau heading “Điểm đặc trưng”) */}
        {highlights.length > 0 && (
          <>
            <SectionTitle>Điểm đặc trưng:</SectionTitle>
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