// src/features/hotels/components/hotel/HotelNearbySection.jsx
import {
  MapPin,
  Navigation,
  Bus,
  PartyPopper,
  CircleDot,
  AlertCircle,
} from "lucide-react";
import { useTranslation } from "react-i18next";

export default function HotelNearbySection({ hotel }) {
  const { t } = useTranslation();
  if (!hotel) return null;

  const address = hotel.addressLine;
  const { lat, lng } = getHotelLatLng(hotel);

  const nearbyPlaces = Array.isArray(hotel.nearbyPlaces)
    ? hotel.nearbyPlaces
    : [];

  const grouped = groupNearbyPlaces(nearbyPlaces);

  return (
    // Không bo góc / không card riêng, chỉ border-top để liền card trên
    <section id="hotel-nearby-section" className="border-t border-gray-100 dark:border-gray-700">
      {/* HEADER */}
      <div className="px-6 pt-5 pb-3">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 dark:text-gray-100">
          {t("hotel.nearby_section_title", { name: hotel.name })}
        </h2>
        {address && (
          <div className="mt-1 flex items-start gap-2 text-xs md:text-sm text-gray-600 dark:text-gray-400">
            <MapPin className="mt-0.5 h-4 w-4 text-[#0064d2]" />
            <span>{address}</span>
          </div>
        )}
      </div>

      {/* MAP */}
      <div className="px-6">
        <div className="relative overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 bg-[#f3f4f6]">
          {lat != null && lng != null ? (
            <iframe
              title={t("hotel.map_title", { name: hotel.name })}
              src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
              className="h-[260px] w-full md:h-[300px]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          ) : (
            <div className="flex h-[260px] w-full items-center justify-center text-xs text-gray-500 dark:text-gray-400 md:h-[300px]">
              {t("hotel.map_not_found")}
            </div>
          )}

          <button
            type="button"
            className="absolute bottom-4 right-4 inline-flex items-center gap-1 rounded-full bg-white dark:bg-gray-800 px-4 py-1.5 text-xs md:text-sm font-semibold text-[#0064d2] shadow-sm hover:bg-[#f3f4ff]"
          >
            {t("hotel.explore_more_places")}
            <Navigation className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Tag nhỏ bên dưới map */}
        <div className="mt-3 inline-flex items-center rounded-full bg-[#e6f4ea] px-3 py-1 text-[11px] font-medium text-[#137333]">
          <span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#34a853]" />
          {t("hotel.near_entertainment_area")}
        </div>
      </div>

      {/* 3 CỘT ĐỊA ĐIỂM */}
      <div className="mt-4 border-t border-gray-100 dark:border-gray-700 px-6 py-4">
        <div className="grid grid-cols-1 gap-8 text-sm md:grid-cols-3">
          {/* Cột 1: Địa điểm lân cận */}
          <NearbyColumn
            icon={<MapPin className="h-3.5 w-3.5" />}
            title={t("hotel.nearby_places")}
            places={grouped.nearby}
          />

          {/* Cột 2: trên là Trung tâm giao thông, dưới là Khác */}
          <div className="space-y-6">
            <NearbyColumn
              icon={<Bus className="h-3.5 w-3.5" />}
              title={t("hotel.transport_hub")}
              places={grouped.transport}
            />
            <NearbyColumn
              icon={<CircleDot className="h-3.5 w-3.5" />}
              title={t("hotel.other")}
              places={grouped.other}
            />
          </div>

          {/* Cột 3: Trung tâm giải trí */}
          <NearbyColumn
            icon={<PartyPopper className="h-3.5 w-3.5" />}
            title={t("hotel.entertainment_hub")}
            places={grouped.entertainment}
          />
        </div>

        {/* Ghi chú khoảng cách + icon chấm than */}
        <p className="mt-4 flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
          <AlertCircle className="h-3.5 w-3.5 text-gray-400" />
          <span>{t("hotel.distance_disclaimer")}</span>
        </p>
      </div>
    </section>
  );
}

/*  SUB COMPONENTS  */

function NearbyColumn({ icon, title, places }) {
  if (!places || !places.length) return null;

  return (
    <div>
      {/* Header + icon */}
      <div className="mb-2 flex items-center gap-2">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e6f2ff] text-[#0064d2]">
          {icon}
        </div>
        <h3 className="text-[13px] font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
      </div>

      {/* List items */}
      <ul className="space-y-1.5">
        {places.map((p) => (
          <li
            key={p.placeSlug || p.name}
            className="flex items-baseline justify-between pl-6 text-[13px] text-gray-700 dark:text-gray-300"
          >
            <span className="truncate">{p.name}</span>
            {p.distanceMeters != null && (
              <span className="ml-3 whitespace-nowrap text-[12px] text-gray-500 dark:text-gray-400">
                {formatDistanceKm(p.distanceMeters)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

/*  HELPERS  */

// Lấy lat/lng từ DTO: ưu tiên latitude/longitude, fallback sang mảng location nếu có
function getHotelLatLng(hotel) {
  if (!hotel) return { lat: null, lng: null };

  let lat =
    typeof hotel.latitude === "number" ? Number(hotel.latitude) : null;
  let lng =
    typeof hotel.longitude === "number" ? Number(hotel.longitude) : null;

  const loc = hotel.location;
  if ((lat == null || lng == null) && Array.isArray(loc) && loc.length === 2) {
    const [a, b] = loc;
    const isAValidLat = Math.abs(a) <= 90;
    const isBValidLat = Math.abs(b) <= 90;

    if (isAValidLat && !isBValidLat) {
      lat = a;
      lng = b;
    } else if (!isAValidLat && isBValidLat) {
      lat = b;
      lng = a;
    } else {
      // default: [lng, lat] giống HotelDoc
      lng = a;
      lat = b;
    }
  }

  return { lat, lng };
}

// Nhóm theo 4 category từ seed
function groupNearbyPlaces(nearbyPlaces) {
  const result = {
    nearby: [],
    transport: [],
    entertainment: [],
    other: [],
  };

  for (const p of nearbyPlaces) {
    const c = (p.categoryLabel || p.category || "").toLowerCase();

    if (c.includes("giao thông")) {
      result.transport.push(p);
    } else if (c.includes("giải trí")) {
      result.entertainment.push(p);
    } else if (c.includes("địa điểm") || c.includes("lân cận")) {
      result.nearby.push(p);
    } else {
      result.other.push(p);
    }
  }

  return result;
}

function formatDistanceKm(meters) {
  const km = meters / 1000;
  return `${km.toFixed(2)} km`;
}