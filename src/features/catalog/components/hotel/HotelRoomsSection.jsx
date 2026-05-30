// src/features/hotels/components/hotel/HotelRoomsSection.jsx
import { useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../../../../i18n";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Users as UsersIcon,
  X as CloseIcon,
} from "lucide-react";
import {
  FaBed,
  FaRulerCombined,
  FaShower,
  FaCouch,
  FaTint,
  FaSnowflake,
  FaBath,
  FaUtensils,
  FaRegCreditCard,
  FaMoneyBillWave,
  FaInfoCircle,
  FaCheckCircle,
  FaTimesCircle,
} from "react-icons/fa";

/** Các filter quick trên đầu */
const QUICK_FILTERS = [
  { key: "FREE_CANCELLATION", label: i18n.t("hotel.filter_free_cancellation") },
  { key: "PAY_AT_HOTEL", label: i18n.t("hotel.filter_pay_at_hotel") },
  { key: "FREE_BREAKFAST", label: i18n.t("hotel.filter_free_breakfast") },
];

export default function HotelRoomsSection({ hotel }) {
  const { t } = useTranslation();
  const [priceMode, setPriceMode] = useState("EXCL_TAX");
  const [activeFilters, setActiveFilters] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState(null);

  if (!hotel) return null;

  const roomTypes = hotel.roomTypes || [];
  if (!roomTypes.length) return null;

  const toggleFilter = (key) => {
    setActiveFilters((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  return (
    <>
      <section
        id="hotel-rooms-section"
        className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-3xl"
      >
        {/* HEADER SECTION TITLE */}
        <div className="flex flex-col gap-3 px-6 pt-5 pb-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 md:text-xl">
              {t("hotel.available_rooms_at", { name: hotel.name })}
            </h2>
          </div>

          {/* “Hiển thị giá” */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">{t("hotel.show_price")}</span>
            <div className="relative">
              <select
                value={priceMode}
                onChange={(e) => setPriceMode(e.target.value)}
                className={[
                  "appearance-none rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800",
                  "px-3 pr-7 py-1.5 text-xs md:text-sm font-medium text-gray-800 dark:text-gray-200",
                  "cursor-pointer outline-none",
                ].join(" ")}
              >
                <option value="EXCL_TAX">
                  {t("hotel.price_mode_excl_tax")}
                </option>
                <option value="INCL_TAX">
                  {t("hotel.price_mode_incl_tax")}
                </option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500 dark:text-gray-400" />
            </div>
          </div>
        </div>

        {/* QUICK FILTER CHIPS */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 dark:border-gray-700 bg-[#f8fafc] px-6 py-3 text-xs md:text-sm">
          <span className="mr-2 text-gray-700 dark:text-gray-300">
            {t("hotel.quick_filter_hint")}
          </span>

          {QUICK_FILTERS.map((f) => (
            <FilterChip
              key={f.key}
              active={activeFilters.includes(f.key)}
              onClick={() => toggleFilter(f.key)}
            >
              {f.label}
            </FilterChip>
          ))}
        </div>

        {/* ROOM LIST */}
        {roomTypes.map((rt) => (
          <RoomTypeRow
            key={rt.id || rt.name}
            roomType={rt}
            hotel={hotel}
            priceMode={priceMode}
            activeFilters={activeFilters}
            onViewDetail={() => setSelectedRoomType(rt)}
          />
        ))}
      </section>

      {/* MODAL XEM CHI TIẾT PHÒNG */}
      {selectedRoomType &&
        createPortal(
          <RoomDetailModal
            roomType={selectedRoomType}
            hotelName={hotel.name}
            priceMode={priceMode}
            onClose={() => setSelectedRoomType(null)}
          />,
          document.body
        )}
    </>
  );
}

/* === SUB COMPONENTS === */

function RoomTypeRow({ hotel, roomType, priceMode, activeFilters, onViewDetail }) {
  const { t } = useTranslation();
  const {
    name,
    shortDescription,
    areaSqm,
    bedType,
    bedsCount,
    maxGuests,
    images,
    ratePlans,
    amenities: roomAmenitiesRaw,
  } = roomType;

  const fallbackImage =
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&q=80&auto=format&fit=crop";

  const imageUrls =
    Array.isArray(images) && images.length
      ? images.map((img) => img.url)
      : [fallbackImage];

  const roomAmenities = Array.isArray(roomAmenitiesRaw)
    ? roomAmenitiesRaw
    : [];

  const [currentIdx, setCurrentIdx] = useState(0);
  const currentImage = imageUrls[currentIdx] || fallbackImage;

  const guests = maxGuests || 2;

  // Tóm tắt mô tả ngay sau tên phòng
  const metaSummary = (() => {
    const parts = [];
    if (areaSqm != null) parts.push(`${areaSqm.toFixed(0)} m²`);

    if (bedsCount || bedType) {
      const bedLabel = bedsCount ? t("hotel.beds_count", { count: bedsCount }) : t("hotel.bed");
      const typeLabel = bedType ? ` (${mapBedType(bedType)})` : "";
      parts.push(`${bedLabel}${typeLabel}`);
    }

    if (guests) parts.push(t("hotel.suitable_for_guests", { count: guests }));

    if (!parts.length) return shortDescription || "";
    return t("hotel.room_meta_summary", { name, details: parts.join(", ") });
  })();

  const summaryText = shortDescription || metaSummary;

  const handlePrev = () => {
    setCurrentIdx((idx) => (idx === 0 ? imageUrls.length - 1 : idx - 1));
  };

  const handleNext = () => {
    setCurrentIdx((idx) => (idx === imageUrls.length - 1 ? 0 : idx + 1));
  };

  // Lọc rate plan theo filter
  const allRatePlans = ratePlans || [];
  const filteredRatePlans = filterRatePlans(allRatePlans, activeFilters);
  const hasFilters = activeFilters && activeFilters.length > 0;
  if (hasFilters && filteredRatePlans.length === 0) {
    return null;
  }

  // Lấy tối đa 4 tiện ích nổi bật từ data
  const highlightAmenities = roomAmenities.length
    ? roomAmenities
        .filter((a) => {
          const sec = (a.section || "").toString().toUpperCase();
          return (
            !sec ||
            sec === "HIGHLIGHT_FEATURES" ||
            sec === "BATHROOM" ||
            sec === "BASIC_FACILITIES"
          );
        })
        .slice(0, 4)
    : [];

  return (
    <div className="border-t border-gray-100 dark:border-gray-700">
      <div className="px-6 py-5">
        {/* Tên phòng + mô tả tóm tắt */}
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 md:text-lg">
            {name}
          </h3>
          {summaryText && (
            <p className="mt-1 text-xs text-gray-700 dark:text-gray-300 md:text-sm">
              {summaryText}
            </p>
          )}
        </div>

        {/* GRID: ảnh trái, bảng giá phải */}
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,2.5fr)] lg:gap-6">
          {/* LEFT: IMAGE SLIDER + META + AMENITIES */}
          <div className="flex flex-col gap-3">
            {/* Ảnh phòng + nút < > + dots */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
              <div className="relative aspect-[4/3] w-full">
                <img
                  src={currentImage}
                  alt={name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />

                {imageUrls.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrev}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-1.5 text-white hover:bg-black/55 md:left-3"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/35 p-1.5 text-white hover:bg-black/55 md:right-3"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>

              {imageUrls.length > 1 && (
                <div className="flex items-center justify-center gap-1 bg-white/80 py-1.5 text-[8px]">
                  {imageUrls.map((_, idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 w-1.5 rounded-full ${
                        idx === currentIdx ? "bg-gray-500" : "bg-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* ROOM META: area, bed, guests */}
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-700 dark:text-gray-300 md:text-sm">
              {areaSqm != null && (
                <div className="inline-flex items-center gap-1">
                  <FaRulerCombined className="h-4 w-4" />
                  <span>{areaSqm.toFixed(1)} m²</span>
                </div>
              )}
              {(bedsCount || bedType) && (
                <div className="inline-flex items-center gap-1">
                  <FaBed className="h-4 w-4" />
                  <span>
                    {bedsCount ? t("hotel.beds_count", { count: bedsCount }) : t("hotel.bed")}
                    {bedType ? ` (${mapBedType(bedType)})` : ""}
                  </span>
                </div>
              )}
              {guests && (
                <div className="inline-flex items-center gap-1">
                  <UsersIcon className="h-4 w-4" />
                  <span>{t("hotel.max_guests", { count: guests })}</span>
                </div>
              )}
            </div>

            {/* Tiện ích nổi bật từ data + icon */}
            {highlightAmenities.length > 0 ? (
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-700 dark:text-gray-300 md:text-xs">
                {highlightAmenities.map((a) => (
                  <div
                    key={a.code || a.name}
                    className="flex items-center gap-1.5"
                  >
                    <RoomAmenityIcon code={a.code} />
                    <span>{a.name}</span>
                  </div>
                ))}
              </div>
            ) : (
              // Fallback nếu backend không gửi room amenities
              <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-gray-700 dark:text-gray-300 md:text-xs">
                <div className="flex items-center gap-1.5">
                  <FaShower className="h-3.5 w-3.5" />
                  <span>{t("hotel.amenity_standing_shower")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaCouch className="h-3.5 w-3.5" />
                  <span>{t("hotel.amenity_seating_area")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaTint className="h-3.5 w-3.5" />
                  <span>{t("hotel.amenity_hot_water")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <FaSnowflake className="h-3.5 w-3.5" />
                  <span>{t("hotel.amenity_air_conditioner")}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={onViewDetail}
              className="mt-2 self-start text-xs font-semibold text-[#0064d2] hover:underline md:text-sm"
            >
              {t("hotel.view_room_detail")}
            </button>
          </div>

          {/* RIGHT: HEADER + RATE PLANS LIST */}
          <div className="space-y-3">
            {/* Header riêng cho từng phòng (desktop) */}
            <div className="hidden grid-cols-[minmax(0,1.6fr)_minmax(0,0.6fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] px-1 pb-1 text-[11px] font-semibold text-gray-500 dark:text-gray-400 md:grid">
              <div>{t("hotel.room_choice")}</div>
              <div className="text-center">{t("hotel.guest")}</div>
              <div className="text-right">{t("hotel.price_per_room_per_night")}</div>
              <div />
            </div>

            {filteredRatePlans.length > 0 ? (
              filteredRatePlans.map((rp) => (
                <RatePlanRow
                  key={rp.id || rp.name}
                  ratePlan={rp}
                  guests={guests}
                  priceMode={priceMode}
                  hotel={hotel}
                  roomType={roomType}
                />
              ))
            ) : (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t("hotel.no_rate_plans")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/*  MODAL CHI TIẾT PHÒNG  */

function RoomDetailModal({ roomType, hotelName, priceMode, onClose }) {
  const { t } = useTranslation();
  const {
    name,
    areaSqm,
    maxGuests,
    bedType,
    bedsCount,
    images,
    amenities: roomAmenitiesRaw,
    ratePlans,
  } = roomType;

  const fallbackImage =
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&q=80&auto=format&fit=crop";

  const imageUrls =
    Array.isArray(images) && images.length
      ? images.map((img) => img.url)
      : [fallbackImage];

  const [currentIdx, setCurrentIdx] = useState(0);
  const currentImage = imageUrls[currentIdx] || fallbackImage;

  const guests = maxGuests || 2;

  const roomAmenities = Array.isArray(roomAmenitiesRaw)
    ? roomAmenitiesRaw
    : [];

  // Group amenities theo section
  const groupedAmenities = roomAmenities.reduce(
    (acc, a) => {
      const sec = (a.section || a.group || "").toString().toUpperCase();
      if (sec.includes("BATH")) acc.bathroom.push(a);
      else if (sec.includes("ROOM") || sec.includes("FACILITIES"))
        acc.room.push(a);
      else if (sec.includes("HIGHLIGHT")) acc.favorite.push(a);
      else acc.basic.push(a);
      return acc;
    },
    { favorite: [], basic: [], room: [], bathroom: [] }
  );

  if (!groupedAmenities.favorite.length && roomAmenities.length) {
    groupedAmenities.favorite = roomAmenities.slice(0, 4);
  }

  // Tính giá khởi điểm từ ratePlans
  const bestPriceMeta = (() => {
    if (!Array.isArray(ratePlans) || ratePlans.length === 0) return null;
    let best = null;
    for (const rp of ratePlans) {
      if (rp.pricePerNight == null) continue;
      const p = Number(rp.pricePerNight);
      if (Number.isNaN(p)) continue;
      if (!best || p < best.price) {
        best = {
          price: p,
          priceIncludesTax: rp.priceIncludesTax,
          taxPercent: rp.taxPercent,
          serviceFeePercent: rp.serviceFeePercent,
        };
      }
    }
    return best;
  })();

  const bestDisplayPrice =
    bestPriceMeta && bestPriceMeta.price != null
      ? computeDisplayPrice(
          bestPriceMeta.price,
          {
            priceIncludesTax: bestPriceMeta.priceIncludesTax,
            taxPercent: bestPriceMeta.taxPercent,
            serviceFeePercent: bestPriceMeta.serviceFeePercent,
          },
          priceMode
        )
      : null;

  const priceText =
    bestDisplayPrice != null
      ? `${bestDisplayPrice.toLocaleString("vi-VN")} VND`
      : t("hotel.contact");

  const metaItems = [];
  if (areaSqm != null) metaItems.push(`${areaSqm.toFixed(1)} m²`);
  if (guests) metaItems.push(t("hotel.guests_count", { count: guests }));
  if (bedsCount || bedType) {
    metaItems.push(
      `${bedsCount ? t("hotel.beds_count", { count: bedsCount }) : t("hotel.bed")}${
        bedType ? ` (${mapBedType(bedType)})` : ""
      }`
    );
  }

  const handlePrev = () => {
    setCurrentIdx((idx) => (idx === 0 ? imageUrls.length - 1 : idx - 1));
  };

  const handleNext = () => {
    setCurrentIdx((idx) => (idx === imageUrls.length - 1 ? 0 : idx + 1));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-2 md:px-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-5 py-3">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {hotelName && `${hotelName} · `}
              {t("hotel.room_type")}
            </p>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 md:text-lg">
              {name}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        </div>

        {/* BODY 2 CỘT */}
        <div className="flex flex-1 flex-col gap-4 px-5 pb-4 pt-3 lg:flex-row">
          {/* LEFT COLUMN: 70% ảnh lớn + 30% thumbnails */}
          <div className="flex w-full flex-col gap-3 lg:w-[60%] xl:w-[65%]">
            {/* Ảnh lớn */}
            <div className="relative flex-[7] min-h-[220px]">
              <img
                src={currentImage}
                alt={name}
                className="h-full w-full rounded-xl object-cover"
              />

              {imageUrls.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/45 p-2 text-white hover:bg-black/70"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {imageUrls.length > 1 && (
              <div className="flex flex-[3] items-center gap-2 overflow-x-auto pb-1">
                {imageUrls.map((url, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIdx(idx)}
                    className={`flex-shrink-0 overflow-hidden rounded-md border-2 ${
                      idx === currentIdx
                        ? "border-[#0064d2]"
                        : "border-transparent"
                    }`}
                  >
                    <img
                      src={url}
                      alt={`${name} thumb ${idx + 1}`}
                      className="h-20 w-32 object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: 80% info scrollable + 20% price fixed */}
          <div className="flex w-full flex-col border-t border-gray-200 dark:border-gray-700 pt-3 lg:w-[40%] lg:border-t-0 lg:border-l lg:pl-4 lg:pt-0">
            {/* Info scrollable */}
            <div className="flex-1 space-y-4 overflow-y-auto pr-1">
              {/* Thông tin phòng */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {t("hotel.room_info")}
                </h4>
                <ul className="mt-1 space-y-1 text-xs text-gray-700 dark:text-gray-300 md:text-sm">
                  {metaItems.map((m, i) => (
                    <li key={i} className="flex items-center gap-2">
                      {i === 0 && (
                        <FaRulerCombined className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                      )}
                      {i === 1 && (
                        <UsersIcon className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                      )}
                      {i === 2 && (
                        <FaBed className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />
                      )}
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Tính năng phòng bạn thích */}
              {groupedAmenities.favorite.length > 0 && (
                <AmenityGroup
                  title={t("hotel.amenity_group_favorite")}
                  items={groupedAmenities.favorite}
                />
              )}

              {/* Tiện nghi cơ bản */}
              {groupedAmenities.basic.length > 0 && (
                <AmenityGroup
                  title={t("hotel.amenity_group_basic")}
                  items={groupedAmenities.basic}
                />
              )}

              {/* Tiện nghi phòng */}
              {groupedAmenities.room.length > 0 && (
                <AmenityGroup
                  title={t("hotel.amenity_group_room")}
                  items={groupedAmenities.room}
                />
              )}

              {/* Tiện nghi phòng tắm */}
              {groupedAmenities.bathroom.length > 0 && (
                <AmenityGroup
                  title={t("hotel.amenity_group_bathroom")}
                  items={groupedAmenities.bathroom}
                />
              )}
            </div>

            {/* PRICE FOOTER – cố định, không scroll */}
            <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
              <p className="text-xs text-gray-600 dark:text-gray-400">{t("hotel.starting_from")}</p>
              <div className="mt-0.5 text-lg font-bold text-[#ff5a00] md:text-xl">
                {priceText}
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {t("hotel.per_room_per_night")} ·{" "}
                {priceMode === "INCL_TAX"
                  ? t("hotel.tax_included")
                  : t("hotel.tax_excluded")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RatePlanRow({ ratePlan, guests, priceMode, hotel, roomType }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    name,
    boardType,
    paymentType,
    refundable,
    cancellationPolicy,
    pricePerNight,
    referencePricePerNight,
    promoLabel,
    priceIncludesTax,
    taxPercent,
    serviceFeePercent,
    // availableRooms, // ĐÃ BỎ
  } = ratePlan;

  const rawPrice =
    pricePerNight !== null && pricePerNight !== undefined
      ? Number(pricePerNight)
      : null;

  const rawRefPrice =
    referencePricePerNight !== null &&
    referencePricePerNight !== undefined
      ? Number(referencePricePerNight)
      : null;

  const displayPrice = computeDisplayPrice(
    rawPrice,
    {
      priceIncludesTax,
      taxPercent,
      serviceFeePercent,
    },
    priceMode
  );

  const displayRefPrice =
    rawRefPrice !== null
      ? computeDisplayPrice(
          rawRefPrice,
          {
            priceIncludesTax,
            taxPercent,
            serviceFeePercent,
          },
          priceMode
        )
      : null;

  const hasDiscount =
    displayRefPrice !== null &&
    displayPrice !== null &&
    displayRefPrice > displayPrice;

  const savingAmount = hasDiscount ? displayRefPrice - displayPrice : 0;

  const priceText = displayPrice
    ? `${displayPrice.toLocaleString("vi-VN")} VND`
    : t("hotel.contact");

  const boardText = mapBoardType(boardType);
  const paymentText = mapPaymentType(paymentType);
  const refundText =
    refundable === false
      ? t("hotel.non_refundable")
      : refundable === true
      ? t("hotel.refundable_policy")
      : null;

  const showRefundText = refundText && !cancellationPolicy;

  const showPromoPill = promoLabel && promoLabel !== "Chỉ còn 1 phòng";

  const isHotelActive = hotel?.active !== false;

  const footerPriceText =
    priceMode === "INCL_TAX"
      ? t("hotel.tax_included")
      : t("hotel.tax_excluded");

  const goBooking = () => {
    if (!isHotelActive) return;
    navigate(
      `/booking/hotel?hotelSlug=${encodeURIComponent(hotel.slug)}&roomTypeId=${roomType.id}&ratePlanId=${ratePlan.id}`
    );
  };

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 dark:border-gray-700 px-4 py-3 text-xs md:text-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1.6fr)_minmax(0,0.6fr)_minmax(0,0.9fr)_minmax(0,0.9fr)] md:items-center">
        {/* LEFT: name + conditions */}
        <div>
          <div className="font-semibold text-gray-900 dark:text-gray-100">{name}</div>
          <ul className="mt-1 space-y-1 text-gray-700 dark:text-gray-300">
            {boardText && (
              <li className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
                <BoardTypeIcon boardType={boardType} />
                <span>{boardText}</span>
              </li>
            )}
            {paymentText && (
              <li className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
                <PaymentTypeIcon paymentType={paymentType} />
                <span>{paymentText}</span>
              </li>
            )}
            {cancellationPolicy && (
              <li className="flex items-center gap-1.5 md:gap-2 text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
                <FaInfoCircle className="h-3.5 w-3.5" />
                <span>{cancellationPolicy}</span>
              </li>
            )}
            {showRefundText && (
              <li className="flex items-center gap-1.5 md:gap-2 text-[11px] md:text-xs text-gray-600 dark:text-gray-400">
                <RefundPolicyIcon refundable={refundable} />
                <span>{refundText}</span>
              </li>
            )}
          </ul>
          {showPromoPill && (
            <div className="mt-1 inline-flex items-center rounded-full bg-[#fff3e6] px-2 py-0.5 text-[11px] font-semibold text-[#ff5a00]">
              {promoLabel}
            </div>
          )}
        </div>

        {/* MIDDLE: guests icons */}
        <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300 md:justify-center">
          {Array.from({ length: Math.min(guests || 2, 4) }).map((_, i) => (
            <UsersIcon key={i} className="h-3.5 w-3.5" />
          ))}
        </div>

        {/* PRICE COLUMN */}
        <div className="flex flex-col items-end gap-0.5">
          {hasDiscount && (
            <div className="text-[11px] font-semibold text-[#ff5a00]">
              {t("hotel.save_amount", { amount: savingAmount.toLocaleString("vi-VN") })}
            </div>
          )}

          {hasDiscount && (
            <div className="text-[11px] text-gray-500 dark:text-gray-400">
              <span className="line-through opacity-60">
                {displayRefPrice.toLocaleString("vi-VN")} VND
              </span>
            </div>
          )}

          <div className="text-base font-bold text-[#ff5a00] md:text-lg">
            {priceText}
          </div>
          <div className="text-[11px] text-gray-500 dark:text-gray-400">
            {footerPriceText}
          </div>
        </div>

        {/* ACTION COLUMN */}
        <div className="flex flex-col items-end justify-center gap-1">
          <button
            type="button"
            disabled={!isHotelActive}
            className={[
              "inline-flex items-center justify-center rounded-lg px-4 py-1.5 text-xs font-semibold text-white transition md:text-sm",
              isHotelActive
                ? "bg-[#007bff] hover:bg-[#ff6b1a]"
                : "bg-gray-400 cursor-not-allowed",
            ].join(" ")}
            onClick={goBooking}
          >
            {t("hotel.select")}
            <ChevronRight className="ml-1 h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

/*  small helpers  */

function FilterChip({ children, active, onClick }) {
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-xs md:text-sm transition";
  const activeStyle = "border-[#0064d2] bg-[#e6f2ff] text-[#0064d2]";
  const inactiveStyle =
    "border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-50";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`${base} ${active ? activeStyle : inactiveStyle}`}
    >
      {children}
    </button>
  );
}

function RoomAmenityIcon({ code }) {
  const c = (code || "").toLowerCase();
  if (c.includes("shower")) return <FaShower className="h-3.5 w-3.5" />;
  if (c.includes("hot_water")) return <FaTint className="h-3.5 w-3.5" />;
  if (c.includes("seating") || c.includes("sofa"))
    return <FaCouch className="h-3.5 w-3.5" />;
  if (c.includes("ac") || c.includes("air"))
    return <FaSnowflake className="h-3.5 w-3.5" />;
  return <FaBath className="h-3.5 w-3.5" />;
}

/*  Icons cho từng loại condition trong bảng giá  */

function BoardTypeIcon({ boardType }) {
  const c = (boardType || "").toUpperCase();
  if (c === "ROOM_ONLY") return <FaBed className="h-3.5 w-3.5" />;
  return <FaUtensils className="h-3.5 w-3.5" />;
}

function PaymentTypeIcon({ paymentType }) {
  const c = (paymentType || "").toUpperCase();
  if (c === "PAY_AT_HOTEL")
    return <FaMoneyBillWave className="h-3.5 w-3.5" />;
  return <FaRegCreditCard className="h-3.5 w-3.5" />;
}

function RefundPolicyIcon({ refundable }) {
  if (refundable === false)
    return <FaTimesCircle className="h-3.5 w-3.5 text-red-500" />;
  if (refundable === true)
    return <FaCheckCircle className="h-3.5 w-3.5 text-green-500" />;
  return <FaInfoCircle className="h-3.5 w-3.5" />;
}

/** Lọc rate plan theo các filter quick */
function filterRatePlans(ratePlans, activeFilters) {
  if (!activeFilters || activeFilters.length === 0) return ratePlans;

  return ratePlans.filter((rp) => {
    // Miễn phí huỷ phòng
    if (
      activeFilters.includes("FREE_CANCELLATION") &&
      rp.refundable !== true
    ) {
      return false;
    }

    // Thanh Toán Tại Khách Sạn
    if (
      activeFilters.includes("PAY_AT_HOTEL") &&
      rp.paymentType !== "PAY_AT_HOTEL"
    ) {
      return false;
    }

    // Miễn phí bữa sáng
    if (
      activeFilters.includes("FREE_BREAKFAST") &&
      rp.boardType !== "BREAKFAST_INCLUDED"
    ) {
      return false;
    }

    return true;
  });
}

/**
 * Tính giá hiển thị theo chế độ EXCL_TAX / INCL_TAX.
 */
function computeDisplayPrice(
  rawPrice,
  { priceIncludesTax, taxPercent, serviceFeePercent },
  priceMode
) {
  if (rawPrice == null) return null;

  const tax = taxPercent != null ? Number(taxPercent) : 0;
  const fee = serviceFeePercent != null ? Number(serviceFeePercent) : 0;
  const totalPct = tax + fee;

  if (!totalPct) {
    return Math.round(rawPrice);
  }

  const factor = 1 + totalPct / 100;

  const includesTax =
    priceIncludesTax === undefined || priceIncludesTax === null
      ? true
      : !!priceIncludesTax;

  if (priceMode === "INCL_TAX") {
    if (includesTax) return Math.round(rawPrice);
    return Math.round(rawPrice * factor);
  } else {
    if (!includesTax) return Math.round(rawPrice);
    return Math.round(rawPrice / factor);
  }
}

// Module-level: dùng i18n.t() global (reload khi đổi ngôn ngữ đảm bảo đúng locale)
function mapBoardType(boardType) {
  if (!boardType) return null;
  return i18n.t(`enum.boardType.${boardType}`, boardType);
}

function mapPaymentType(paymentType) {
  if (!paymentType) return null;
  return i18n.t(`enum.paymentType.${paymentType}`, paymentType);
}

function mapBedType(bedType) {
  if (!bedType) return bedType;
  return i18n.t(`enum.bedType.${bedType}`, bedType);
}

/* Nhóm tiện nghi trong modal theo title */
function AmenityGroup({ title, items }) {
  if (!items || !items.length) return null;
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{title}</h4>
      <ul className="mt-1 grid grid-cols-1 gap-y-1 text-xs text-gray-700 dark:text-gray-300 md:grid-cols-2 md:text-sm">
        {items.map((a) => (
          <li key={a.code || a.name} className="flex items-center gap-1.5">
            <span className="mt-0.5 h-1 w-1 rounded-full bg-gray-400" />
            <span>{a.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}