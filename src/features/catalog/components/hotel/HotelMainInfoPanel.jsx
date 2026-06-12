// src/features/hotels/components/hotel/HotelMainInfoPanel.jsx
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { createPortal } from "react-dom";
import {
  FaMapMarkerAlt,
  FaSnowflake,
  FaStar,
  FaUtensils,
  FaWifi,
} from "react-icons/fa";
import StarRating from "../../../review/components/StarRating";
import { getRatingLabel } from "../../../review/utils/ratingUtils";
import { FiCheckCircle, FiClock } from "react-icons/fi";
import FavoriteButton from "../../../../components/FavoriteButton";

export default function HotelMainInfoPanel({ hotel }) {
  const { t } = useTranslation();
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

  /* == GIÁ THẤP NHẤT TỪ RATE PLAN == */
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

  const allReviews = useSelector((s) => s.review.reviews);
  const topReviews = [...allReviews]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 2);

  const computedRatingLabel = getRatingLabel(parseFloat(score));

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

  const typeLabel = hotelType
    ? t(`enum.hotelType.${hotelType}`, hotelType)
    : "";

  /* == GALLERY == */
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

  /* == NEARBY + XEM THÊM == */
  const allNearby = Array.isArray(nearbyPlaces) ? nearbyPlaces : [];
  const MAX_NEARBY_COLLAPSED = 7;
  const hasManyNearby = allNearby.length > MAX_NEARBY_COLLAPSED;
  const visibleNearby =
    hasManyNearby && !showAllNearby
      ? allNearby.slice(0, MAX_NEARBY_COLLAPSED)
      : allNearby;

  /* == OVERVIEW TỪ CONTENT SECTION == */
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
    name && name.length
      ? t("hotel.about_hotel_named", { name })
      : t("hotel.about_property");

  const descriptionText = description || "";
  const shouldShowOverviewButton =
    hasOverview || descriptionText.length > 160;

  /* == HANDLER GALLERY == */
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
      <div className="rounded-t-3xl overflow-hidden bg-gray-200 dark:bg-gray-700">
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
                {t("hotel.see_all_images")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* HEADER + GIÁ */}
      <div className="px-6 pt-5 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: tên + sao + loại */}
        <div>
          <div className="flex items-center justify-between gap-4">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-900 dark:text-gray-100">
              {name}
            </h1>
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            {typeLabel && (
              <span className="inline-flex items-center rounded-full bg-[#f0f7ff] dark:bg-sky-950/40 text-[#0064d2] dark:text-sky-300 px-2 py-0.5 text-xs font-semibold">
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
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{locationText}</p>
          )}

          {/* Check-in online (dynamic) */}
          {hasOnlineCheckin && (
            <div className="mt-2 flex items-center gap-2 text-sm text-[#007b39] font-semibold">
              <FiCheckCircle className="w-4 h-4" />
              <span>{t("hotel.online_checkin_available")}</span>
            </div>
          )}

          {/* Rating tổng */}
          {ratingScore && (
            <div className="mt-3 flex items-center gap-3 text-sm">
              <FavoriteButton
                targetType="HOTEL"
                targetId={hotel.id}
                showCount={true}
                initialCount={hotel.favoriteCount || 0}
                variant="detail"
              />
              <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 text-white font-semibold">
                <FaStar className="w-3 h-3 text-yellow-300" />
                {ratingScore}
              </div>
              {computedRatingLabel && (
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {computedRatingLabel}
                </span>
              )}
              <span className="text-gray-500 dark:text-gray-400">
                {t("hotel.reviews_count", { count: reviews })}
              </span>
            </div>
          )}
        </div>

        {/* Right: giá + nút chọn phòng */}
        <div className="text-right self-start md:self-center">
          <div className="text-xs text-gray-500 dark:text-gray-400">{t("hotel.price_per_room_per_night_from")}</div>
          <div className="text-xl md:text-2xl font-bold text-[#ff5a00]">
            {price ? `${price} ${currency}` : t("hotel.contact_for_price")}
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
            {t("hotel.select_room")}
          </button>
        </div>
      </div>

      {/* DẢI THÔNG BÁO XANH DƯƠNG */}
      {hasLowAvailability && (
        <div className="border-t border-sky-100 dark:border-sky-900/50 bg-[#e6f5ff] dark:bg-sky-950/35 px-6 py-3 flex items-center gap-3 text-sm text-[#00529b] dark:text-sky-200">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-sm">
            <FiClock className="w-4 h-4" />
          </div>
          <p>
            <span className="font-semibold">{t("hotel.low_availability_title")}</span>{" "}
            {t("hotel.low_availability_prefix")}{" "}
            <span className="font-semibold">{t("hotel.low_availability_rooms")}</span>{" "}
            {t("hotel.low_availability_suffix")}
          </p>
        </div>
      )}

      {/* GRID 3 CỘT */}
      <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-5 grid grid-cols-1 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1.3fr)_minmax(0,1fr)] gap-4 md:gap-6">
        {/* Cột 1: đánh giá */}
        <div className="bg-white dark:bg-slate-800 border border-sky-100 dark:border-slate-700 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-[#00529b]">
                  {score}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">/ 5</span>
              </div>
              <StarRating value={parseFloat(score) || 0} readonly size={13} />
            </div>
            <div className="text-right text-xs">
              {computedRatingLabel && (
                <div className="font-semibold text-gray-800 dark:text-gray-200">
                  {computedRatingLabel}
                </div>
              )}
              <button className="text-[#0064d2] hover:underline">
                {t("hotel.reviews_count_short", { count: reviews })}
              </button>
            </div>
          </div>

          <div className="mt-1 text-sm font-semibold text-gray-800 dark:text-gray-200">
            {t("hotel.what_guests_say")}
          </div>

          {topKeywords.length === 0 && topReviews.length === 0 ? (
            <p className="text-xs text-gray-400 dark:text-gray-500 italic">
              {t("hotel.no_reviews_yet")}
            </p>
          ) : (
            <div className="space-y-2">
              {/* Aspects trước */}
              {topKeywords.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {topKeywords.map((k) => (
                    <span
                      key={k.code}
                      className="inline-flex items-center rounded-full bg-[#e5f8ef] text-[#008f57] px-2 py-0.5 text-xs"
                    >
                      {k.label}
                      {k.count != null && (
                        <span className="ml-1 text-[#00c87a]">·{k.count}</span>
                      )}
                    </span>
                  ))}
                </div>
              )}

              {/* Reviews sau */}
              {topReviews.length > 0 && (
                <div className="space-y-2 pt-1 border-t border-sky-100 dark:border-gray-700">
                  {topReviews.map((r) => (
                    <div key={r.id} className="flex items-start gap-2">
                      <img
                        src={
                          r.userAvatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(r.userFullname || "U")}&background=dbeafe&color=1d4ed8&size=32&bold=true`
                        }
                        alt={r.userFullname || t("hotel.guest")}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate block">
                          {r.userFullname || t("hotel.guest")}
                        </span>
                        <StarRating value={r.rating} readonly size={13} />
                        {r.content && (
                          <p className="text-[13px] leading-snug text-gray-600 dark:text-gray-400 line-clamp-2 mt-0.5">
                            {r.content}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Cột 2: trong khu vực */}
        <div className="bg-white dark:bg-slate-800 border border-sky-100 dark:border-slate-700 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-gray-800 dark:text-gray-200">
              {t("hotel.in_the_area")}
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
              {t("hotel.view_map")}
            </button>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-800 dark:text-gray-200">
            <FaMapMarkerAlt className="w-4 h-4 mt-0.5 text-[#ff5a00]" />
            <div>
              <div>{locationText}</div>
              {distanceKm && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {t("hotel.distance_to_center", { distance: distanceKm })}
                </div>
              )}
            </div>
          </div>

          {generalInfo?.popularAreaSummary && (
            <div className="inline-flex items-center rounded-full bg-[#e5f4ff] text-[#00529b] px-2.5 py-1 text-xs font-semibold">
              {t("hotel.near_entertainment_area")}
            </div>
          )}

          <div className="mt-2 space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
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
                  <span className="shrink-0 text-gray-500 dark:text-gray-400">
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
              {showAllNearby ? t("common.collapse") : `${t("common.see_more")} >`}
            </button>
          )}
        </div>

        {/* Cột 3: tiện ích chính */}
        <div className="bg-white dark:bg-slate-800 border border-sky-100 dark:border-slate-700 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-gray-800 dark:text-gray-200">
              {t("hotel.main_amenities")}
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
              {t("common.see_more")}
            </button>
          </div>
          <div className="space-y-2 text-sm text-gray-800 dark:text-gray-200">
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
                  <span>{t("hotel.amenity_air_conditioning")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaWifi className="w-4 h-4" />
                  <span>{t("hotel.amenity_free_wifi")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUtensils className="w-4 h-4" />
                  <span>{t("hotel.amenity_restaurant")}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* OVERVIEW NGẮN / MỞ RỘNG INLINE */}
      {(overviewPreview || descriptionText) && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-6 py-4 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
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
                  {`${t("common.see_more")} >`}
                </button>
              )}
            </>
          ) : (
            <>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
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
                            className="font-semibold text-gray-900 dark:text-gray-100"
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
                {t("common.collapse")}
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
            className="fixed inset-0 z-[200] bg-black/80 flex flex-col items-center justify-center"
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