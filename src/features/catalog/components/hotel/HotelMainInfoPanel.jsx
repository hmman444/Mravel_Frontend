// src/features/hotels/components/hotel/HotelMainInfoPanel.jsx
import { useState } from "react";
import { createPortal } from "react-dom";
import {
  FaMapMarkerAlt,
  FaSnowflake,
  FaStar,
  FaUtensils,
  FaWifi,
} from "react-icons/fa";
import { FiCheckCircle, FiClock } from "react-icons/fi";

export default function HotelMainInfoPanel({ hotel }) {
  const [showAllNearby, setShowAllNearby] = useState(false);
  const [showFullOverview, setShowFullOverview] = useState(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!hotel) return null;

  const {
    name,
    starRating,
    hotelType,
    avgRating,
    reviewsCount,
    ratingLabel,
    minNightlyPrice,
    currencyCode,
    addressLine,
    generalInfo,
    nearbyPlaces,
    amenities,
    description,
    images,
    roomTypes,
    hasOnlineCheckin,
    content,
  } = hotel;

  const score =
    typeof avgRating === "number" ? avgRating.toFixed(1) : "8,9";
  const reviews = reviewsCount ?? 0;

  /* ================= GIÁ THẤP NHẤT TỪ RATE PLAN ================= */
  const findBestPriceFromRooms = (rooms) => {
    if (!Array.isArray(rooms)) return null;
    let best = null;

    rooms.forEach((rt) => {
      if (!Array.isArray(rt.ratePlans)) return;
      rt.ratePlans.forEach((rp) => {
        if (!rp || rp.pricePerNight == null) return;
        const num = Number(rp.pricePerNight);
        if (Number.isNaN(num)) return;
        if (best == null || num < best) best = num;
      });
    });

    return best;
  };

  const bestPriceFromRatePlans = findBestPriceFromRooms(roomTypes);
  const displayPriceRaw =
    bestPriceFromRatePlans != null
      ? bestPriceFromRatePlans
      : minNightlyPrice != null
      ? Number(minNightlyPrice)
      : null;

  const price =
    displayPriceRaw != null
      ? displayPriceRaw.toLocaleString("vi-VN")
      : null;
  const currency = currencyCode || "VND";

  const locationText = [addressLine]
    .filter(Boolean)
    .join(", ");

  const distanceKm =
    generalInfo?.distanceToCityCenterKm != null
      ? generalInfo.distanceToCityCenterKm.toFixed(2)
      : null;

  const keywords = hotel.reviewStats?.keywords ?? [];
  const topKeywords = keywords.slice(0, 4);

  /* ================= TIỆN ÍCH CHÍNH ================= */
  const amenityList = Array.isArray(amenities) ? amenities : [];
  const prioritizedCodes = [
    "ac",
    "restaurant",
    "front_desk_24h",
    "parking",
    "wifi_free",
  ];

  const mainAmenities = (() => {
    const picked = [];
    const pickedCodes = new Set();

    prioritizedCodes.forEach((code) => {
      const found = amenityList.find(
        (a) => (a.code || "").toLowerCase() === code
      );
      if (found) {
        picked.push(found);
        pickedCodes.add((found.code || "").toLowerCase());
      }
    });

    if (picked.length < 5) {
      amenityList.forEach((a) => {
        const c = (a.code || "").toLowerCase();
        if (!pickedCodes.has(c) && picked.length < 5) {
          picked.push(a);
          pickedCodes.add(c);
        }
      });
    }

    return picked;
  })();

  const formatDistance = (meters) => {
    if (!meters && meters !== 0) return null;
    const km = meters / 1000;
    if (km < 1) return `${meters.toFixed(0)} m`;
    return `${km.toFixed(2)} km`;
  };

  const typeLabel = (() => {
    switch (hotelType) {
      case "VILLA":
        return "Biệt thự";
      case "HOTEL":
        return "Khách sạn";
      case "HOMESTAY":
        return "Homestay";
      case "HOSTEL":
        return "Hostel";
      default:
        return hotelType || "";
    }
  })();

  /* ================= GALLERY ================= */
  const galleryImages = (images && images.length ? images : []).map(
    (img) => img.url
  );
  const mainImage =
    galleryImages[0] ||
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80&auto=format&fit=crop";
  const sideImages = galleryImages.slice(1, 5);
  const totalImages = galleryImages.length;

  const hasLowAvailability =
    Array.isArray(roomTypes) &&
    roomTypes.some((rt) =>
      Array.isArray(rt.ratePlans)
        ? rt.ratePlans.some((rp) => rp.showLowAvailability)
        : false
    );

  const ratingScore =
    typeof avgRating === "number" ? avgRating.toFixed(1) : null;

  /* ================= NEARBY + XEM THÊM ================= */
  const allNearby = Array.isArray(nearbyPlaces) ? nearbyPlaces : [];
  const MAX_NEARBY_COLLAPSED = 7;
  const hasManyNearby = allNearby.length > MAX_NEARBY_COLLAPSED;
  const visibleNearby =
    hasManyNearby && !showAllNearby
      ? allNearby.slice(0, MAX_NEARBY_COLLAPSED)
      : allNearby;

  /* ================= OVERVIEW TỪ CONTENT SECTION ================= */
  const contentBlocks = Array.isArray(content) ? content : [];

  const getSectionName = (b) => {
    if (!b) return "";
    const raw =
      b.section ??
      b.contentSection ??
      b.blockSection ??
      (b.section && b.section.name) ??
      (b.contentSection && b.contentSection.name) ??
      "";
    return raw.toString().toUpperCase();
  };

  const getBlockText = (b) => {
    if (!b) return "";
    const direct =
      b.text ||
      b.body ||
      b.content ||
      b.description ||
      b.title ||
      b.heading ||
      b.paragraph ||
      b.value;
    if (direct) return direct;

    if (b.data) {
      return (
        b.data.text ||
        b.data.body ||
        b.data.content ||
        b.data.description ||
        ""
      );
    }
    return "";
  };

  // Chỉ lấy các block thuộc section OVERVIEW
  const overviewBlocks = contentBlocks.filter((b) =>
    getSectionName(b).includes("OVERVIEW")
  );

  const overviewTexts = overviewBlocks
    .map(getBlockText)
    .filter((t) => t && t.trim().length > 0);

  const fullOverviewText = overviewTexts.join(" ");
  const hasOverview = overviewTexts.length > 0;

  const PREVIEW_CHAR_LIMIT = 260;

  // Preview ưu tiên OVERVIEW, fallback description
  const overviewPreview = hasOverview
    ? fullOverviewText.length > PREVIEW_CHAR_LIMIT
      ? fullOverviewText.slice(0, PREVIEW_CHAR_LIMIT).trimEnd() + "..."
      : fullOverviewText
    : description;

  const overviewTitle =
    name && name.length ? `Giới thiệu ${name}` : "Giới thiệu chỗ nghỉ";

  const descriptionText = description || "";
  const shouldShowOverviewButton =
    hasOverview || descriptionText.length > 160;

  /* ================= HANDLER GALLERY ================= */
  const openGalleryAt = (idx) => {
    if (totalImages === 0) return;
    setCurrentImageIndex(
      idx < 0 ? 0 : idx >= totalImages ? 0 : idx
    );
    setIsGalleryOpen(true);
  };

  const goPrev = (e) => {
    e.stopPropagation();
    if (totalImages <= 1) return;
    setCurrentImageIndex((idx) => (idx - 1 + totalImages) % totalImages);
  };

  const goNext = (e) => {
    e.stopPropagation();
    if (totalImages <= 1) return;
    setCurrentImageIndex((idx) => (idx + 1) % totalImages);
  };

  return (
    <section>
      {/* GALLERY TRÊN CÙNG */}
      <div className="rounded-t-3xl overflow-hidden bg-gray-200">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[2px] bg-black/5">
          {/* Ảnh lớn bên trái */}
          <div className="lg:col-span-2 relative">
            <img
              src={mainImage}
              alt={name}
              onClick={() => openGalleryAt(0)}
              className="w-full h-[260px] md:h-[360px] lg:h-[420px] object-cover cursor-pointer"
            />
          </div>

          {/* Ảnh nhỏ bên phải */}
          <div className="hidden lg:grid grid-cols-2 grid-rows-2 gap-[2px]">
            {sideImages.slice(0, 3).map((url, idx) => (
              <div key={idx} className="relative">
                <img
                  src={url}
                  alt={name}
                  onClick={() => openGalleryAt(idx + 1)}
                  className="w-full h-full object-cover cursor-pointer"
                  loading="lazy"
                />
              </div>
            ))}

            {/* Ô cuối "Xem tất cả hình ảnh" */}
            <div className="relative">
              <img
                src={
                  sideImages[3] ||
                  sideImages[2] ||
                  sideImages[1] ||
                  sideImages[0] ||
                  mainImage
                }
                alt={name}
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => openGalleryAt(0)}
                className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-sm font-semibold gap-1"
              >
                Xem tất cả hình ảnh
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* HEADER + GIÁ */}
      <div className="px-6 pt-5 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: tên + sao + loại */}
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
            {name}
          </h1>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            {typeLabel && (
              <span className="inline-flex items-center rounded-full bg-[#f0f7ff] text-[#0064d2] px-2 py-0.5 text-xs font-semibold">
                {typeLabel}
              </span>
            )}

            {starRating != null && starRating > 0 && (
              <span className="inline-flex items-center gap-1 text-yellow-400">
                {Array.from({ length: starRating }).map((_, i) => (
                  <FaStar key={i} className="w-3.5 h-3.5" />
                ))}
              </span>
            )}
          </div>

          {/* Địa chỉ */}
          {locationText && (
            <p className="mt-1 text-sm text-gray-600">{locationText}</p>
          )}

          {/* Check-in online (dynamic) */}
          {hasOnlineCheckin && (
            <div className="mt-2 flex items-center gap-2 text-sm text-[#007b39] font-semibold">
              <FiCheckCircle className="w-4 h-4" />
              <span>Đã có Check-in Trực Tuyến</span>
            </div>
          )}

          {/* Rating tổng */}
          {ratingScore && (
            <div className="mt-3 inline-flex items-center gap-2 text-sm">
              <div className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold">
                {ratingScore}
                <span className="text-xs ml-0.5">/10</span>
              </div>
              <span className="font-semibold text-gray-800">
                {ratingLabel || "Rất tốt"}
              </span>
              <span className="text-gray-500">
                ({reviews} đánh giá)
              </span>
            </div>
          )}
        </div>

        {/* Right: giá + nút chọn phòng */}
        <div className="text-right self-start md:self-center">
          <div className="text-xs text-gray-500">Giá/phòng/đêm từ</div>
          <div className="text-xl md:text-2xl font-bold text-[#ff5a00]">
            {price ? `${price} ${currency}` : "Liên hệ"}
          </div>
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById("hotel-rooms-section");
              if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }}
            className="mt-2 inline-flex items-center justify-center rounded-lg bg-[#ff5a00] px-4 py-2 text-sm font-semibold text-white hover:bg-[#ff6a1a] transition"
          >
            Chọn phòng
          </button>
        </div>
      </div>

      {/* DẢI THÔNG BÁO XANH DƯƠNG */}
      {hasLowAvailability && (
        <div className="border-t border-sky-100 bg-[#e6f5ff] px-6 py-3 flex items-center gap-3 text-sm text-[#00529b]">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm">
            <FiClock className="w-4 h-4" />
          </div>
          <p>
            <span className="font-semibold">Dừng khoảng chừng là 2 giây!</span> Chỉ còn{" "}
            <span className="font-semibold">1 phòng</span> có giá thấp nhất này!
          </p>
        </div>
      )}

      {/* GRID 3 CỘT */}
      <div className="border-t border-gray-100 px-6 py-5 grid grid-cols-1 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1fr)] gap-4 md:gap-6">
        {/* Cột 1: đánh giá */}
        <div className="bg-[#f5fbff] border border-sky-100 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-[#00529b]">
                {score}
              </span>
              <span className="text-sm text-gray-500">/10</span>
            </div>
            <div className="text-right text-xs">
              {ratingLabel && (
                <div className="font-semibold text-gray-800">
                  {ratingLabel}
                </div>
              )}
              <button className="text-[#0064d2] hover:underline">
                {reviews} đánh giá
              </button>
            </div>
          </div>

          <div className="mt-1 text-sm font-semibold text-gray-800">
            Khách nói gì về kỳ nghỉ của họ
          </div>

          {topKeywords.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-1">
              {topKeywords.map((k) => (
                <span
                  key={k.code}
                  className="inline-flex items-center rounded-full bg-[#e5f8ef] text-[#008f57] px-2.5 py-1 text-xs"
                >
                  {k.label}
                  {k.count != null && ` (${k.count})`}
                </span>
              ))}
            </div>
          )}

          {/* review demo */}
          <div className="mt-3 space-y-2 text-xs text-gray-700">
            <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-800">
                  Khách ẩn danh
                </span>
                <span className="text-[11px] font-semibold text-[#00529b]">
                  {score} / 10
                </span>
              </div>
              <p className="line-clamp-2">
                Ấn tượng tốt về sự chu đáo, thân thiện của nhân viên, phòng
                ốc sạch sẽ và không gian yên tĩnh.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-gray-800">
                  Khách ẩn danh
                </span>
                <span className="text-[11px] font-semibold text-[#00529b]">
                  {score} / 10
                </span>
              </div>
              <p className="line-clamp-2">
                Vị trí gần trung tâm, đi lại thuận tiện, giá cả hợp lý so
                với chất lượng.
              </p>
            </div>
          </div>
        </div>

        {/* Cột 2: trong khu vực */}
        <div className="bg-[#f5fbff] border border-sky-100 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-gray-800">
              Trong khu vực
            </div>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("hotel-nearby-section");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className="text-xs font-semibold text-[#0064d2] hover:underline"
            >
              Xem bản đồ
            </button>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-800">
            <FaMapMarkerAlt className="w-4 h-4 mt-0.5 text-[#ff5a00]" />
            <div>
              <div>{locationText}</div>
              {distanceKm && (
                <div className="text-xs text-gray-500 mt-0.5">
                  Cách trung tâm khoảng {distanceKm} km
                </div>
              )}
            </div>
          </div>

          {generalInfo?.popularAreaSummary && (
            <div className="inline-flex items-center rounded-full bg-[#e5f4ff] text-[#00529b] px-2.5 py-1 text-xs font-semibold">
              Gần khu vui chơi giải trí
            </div>
          )}

          <div className="mt-2 space-y-1.5 text-xs text-gray-700">
            {visibleNearby.map((p) => (
              <div
                key={p.placeSlug || p.name}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                  <span className="line-clamp-1">{p.name}</span>
                </div>
                {p.distanceMeters != null && (
                  <span className="shrink-0 text-gray-500">
                    {formatDistance(p.distanceMeters)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {hasManyNearby && (
            <button
              type="button"
              onClick={() => setShowAllNearby((v) => !v)}
              className="mt-1 self-start text-xs font-semibold text-[#0064d2] hover:underline"
            >
              {showAllNearby ? "Thu gọn" : "Xem thêm >"}
            </button>
          )}
        </div>

        {/* Cột 3: tiện ích chính */}
        <div className="bg-[#f5fbff] border border-sky-100 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-gray-800">
              Tiện ích chính
            </div>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("hotel-amenities-section");
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className="text-xs font-semibold text-[#0064d2] hover:underline"
            >
              Xem thêm
            </button>
          </div>
          <div className="space-y-2 text-sm text-gray-800">
            {mainAmenities.map((a) => (
              <div
                key={a.code || a.name}
                className="flex items-center gap-2"
              >
                <AmenityIcon code={a.code} />
                <span>{a.name}</span>
              </div>
            ))}

            {mainAmenities.length === 0 && (
              <>
                <div className="flex items-center gap-2">
                  <FaSnowflake className="w-4 h-4" />
                  <span>Máy lạnh</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaWifi className="w-4 h-4" />
                  <span>WiFi miễn phí</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUtensils className="w-4 h-4" />
                  <span>Nhà hàng</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* OVERVIEW NGẮN / MỞ RỘNG INLINE */}
      {(overviewPreview || descriptionText) && (
        <div className="border-t border-gray-100 px-6 py-4 text-sm text-gray-700 leading-relaxed">
          {!showFullOverview ? (
            <>
              <p className="line-clamp-3 md:line-clamp-2">
                {overviewPreview || descriptionText}
              </p>
              {shouldShowOverviewButton && (
                <button
                  type="button"
                  onClick={() => setShowFullOverview(true)}
                  className="mt-1 text-sm font-semibold text-[#0064d2] hover:underline"
                >
                  Xem thêm &gt;
                </button>
              )}
            </>
          ) : (
            <>
              <h3 className="font-semibold text-gray-900">
                {overviewTitle}
              </h3>
              <div className="mt-2 space-y-2">
                {hasOverview
                  ? overviewBlocks.map((b, idx) => {
                      const text = getBlockText(b);
                      if (!text) return null;

                      const type = (
                        b.type ||
                        b.blockType ||
                        b.kind ||
                        ""
                      ).toUpperCase();
                      const isHeading =
                        type === "HEADING" || type === "TITLE";

                      if (isHeading) {
                        return (
                          <h4
                            key={idx}
                            className="font-semibold text-gray-900"
                          >
                            {text}
                          </h4>
                        );
                      }

                      return (
                        <p key={idx} className="whitespace-pre-line">
                          {text}
                        </p>
                      );
                    })
                  : (
                    <p className="whitespace-pre-line">
                      {descriptionText}
                    </p>
                    )}
              </div>

              <button
                type="button"
                onClick={() => setShowFullOverview(false)}
                className="mt-2 text-sm font-semibold text-[#0064d2] hover:underline"
              >
                Thu gọn
              </button>
            </>
          )}
        </div>
      )}

      {/* GALLERY OVERLAY FULLSCREEN – PORTAL ra body */}
      {isGalleryOpen &&
        totalImages > 0 &&
        createPortal(
          <div
            className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center"
            onClick={() => setIsGalleryOpen(false)}
          >
            <div
              className="relative max-w-5xl w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={galleryImages[currentImageIndex]}
                alt={name}
                className="w-full max-h-[70vh] object-contain rounded-xl"
              />

              {totalImages > 1 && (
                <>
                  <button
                    type="button"
                    onClick={goPrev}
                    className="absolute left-0 top-1/2 -translate-y-1/2 ml-2 rounded-full bg-black/60 w-8 h-8 flex items-center justify-center text-white text-lg"
                  >
                    &lt;
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    className="absolute right-0 top-1/2 -translate-y-1/2 mr-2 rounded-full bg-black/60 w-8 h-8 flex items-center justify-center text-white text-lg"
                  >
                    &gt;
                  </button>
                </>
              )}
            </div>

            <div
              className="mt-4 flex gap-2 overflow-x-auto px-4 pb-2 w-full max-w-5xl"
              onClick={(e) => e.stopPropagation()}
            >
              {galleryImages.map((url, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`flex-shrink-0 rounded-md overflow-hidden border-2 ${
                    idx === currentImageIndex
                      ? "border-white"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img
                    src={url}
                    alt={name}
                    className="w-24 h-16 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </section>
  );
}

function AmenityIcon({ code }) {
  const c = (code || "").toLowerCase();
  if (c.includes("wifi")) return <FaWifi className="w-4 h-4" />;
  if (c.includes("restaurant") || c.includes("breakfast"))
    return <FaUtensils className="w-4 h-4" />;
  if (c.includes("ac") || c.includes("air") || c.includes("aircon"))
    return <FaSnowflake className="w-4 h-4" />;
  return <FaSnowflake className="w-4 h-4" />;
}