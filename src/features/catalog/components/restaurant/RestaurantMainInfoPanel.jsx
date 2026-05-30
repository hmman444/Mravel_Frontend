import { FaMapMarkerAlt, FaFlag, FaDollarSign, FaClock, FaStar } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import i18n from "../../../../i18n";
import FavoriteButton from "../../../../components/FavoriteButton";

/*  Helpers  */
const formatCurrencyVND = (v) => {
  if (v === null || v === undefined) return null;
  const n = typeof v === "number" ? v : Number(v);
  if (Number.isNaN(n)) return null;
  return n.toLocaleString("vi-VN");
};

// Map priceLevel từ BE -> $/$$/$$$/$$$$
const priceLevelToSymbol = (lv) => {
  const map = { CHEAP: "$", MODERATE: "$$", EXPENSIVE: "$$$", LUXURY: "$$$$" };
  return map[lv] || null;
};

// Gộp địa chỉ đẹp
const buildAddress = (r) => {
  const parts = [r?.addressLine, r?.wardName, r?.districtName, r?.cityName].filter(Boolean);
  return parts.join(", ");
};

// Mô tả loại hình + cuisines (t: hàm dịch i18n)
const buildTypeCuisine = (r, t) => {
  const typeText = r?.restaurantType
    ? t(`enum.restaurantType.${r.restaurantType}`, r.restaurantType)
    : null;

  const cuisinesText = Array.isArray(r?.cuisines)
    ? r.cuisines.map((c) => c?.name).filter(Boolean).join(" - ")
    : null;

  if (typeText && cuisinesText) return `${typeText} • ${cuisinesText}`;
  return typeText || cuisinesText || null;
};

// Parse "HH:mm:ss" -> minutes of day
const parseHMS = (t) => {
  if (!t) return null;
  const [hh = "0", mm = "0", ss = "0"] = String(t).split(":");
  return Number(hh) * 60 + Number(mm) + Number(ss) / 60;
};

// Tính trạng thái mở cửa HÔM NAY từ openingHours DTO của BE
const computeOpenStatus = (openingHours = []) => {
  if (!Array.isArray(openingHours) || openingHours.length === 0) return null;

  const dayIdx = new Date().getDay(); // 0=Sun..6=Sat
  const names = ["SUNDAY","MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"];
  const todayName = names[dayIdx];

  const today = openingHours.find((d) => d?.dayOfWeek === todayName);
  if (!today) return null;

  if (today.closed) return { kind: "closed", label: i18n.t("restaurant.today_closed") };
  if (today.open24h) return { kind: "open", label: i18n.t("restaurant.open_24h_today") };

  const now = new Date();
  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const openM = parseHMS(today.openTime);
  const closeM = parseHMS(today.closeTime);
  if (openM == null || closeM == null) return null;

  if (minutesNow < openM) {
    const hh = String(Math.floor(openM / 60)).padStart(2, "0");
    const mm = String(Math.floor(openM % 60)).padStart(2, "0");
    return { kind: "soon", label: i18n.t("restaurant.opening_soon", { time: `${hh}:${mm}` }) };
  }
  if (minutesNow >= openM && minutesNow <= closeM) {
    const hh = String(Math.floor(closeM / 60)).padStart(2, "0");
    const mm = String(Math.floor(closeM % 60)).padStart(2, "0");
    return { kind: "open", label: i18n.t("restaurant.open_now_until", { time: `${hh}:${mm}` }) };
  }
  const hh = String(Math.floor(openM / 60)).padStart(2, "0");
  const mm = String(Math.floor(openM % 60)).padStart(2, "0");
  return { kind: "closed", label: i18n.t("restaurant.closed_open_tomorrow", { time: `${hh}:${mm}` }) };
};

export default function RestaurantMainInfoPanel({ restaurant }) {
  const { t } = useTranslation();
  if (!restaurant) return null;

  const address = buildAddress(restaurant);
  const typeCuisine = buildTypeCuisine(restaurant, t);
  const minV = formatCurrencyVND(restaurant?.minPricePerPerson);
  const maxV = formatCurrencyVND(restaurant?.maxPricePerPerson);
  const currency = restaurant?.currencyCode || "VND";
  const priceLevelSym = priceLevelToSymbol(restaurant?.priceLevel);

  const openStatus = computeOpenStatus(restaurant?.openingHours);
  const openClass =
    openStatus?.kind === "open"
      ? "text-emerald-600"
      : openStatus?.kind === "soon"
      ? "text-amber-600"
      : "text-gray-500 dark:text-gray-400";

  const score =
    typeof restaurant?.avgRating === "number"
      ? restaurant.avgRating.toFixed(1)
      : null;

  return (
    // Panel KHÔNG bọc viền/bóng — card đã được bọc từ trang ngoài
    <section className="p-4 md:p-5">
      {/* Tên + rating */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 leading-snug">
            {restaurant?.name || restaurant?.slug || t("restaurant.fallback_name")}
          </h1>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <FavoriteButton
          targetType="RESTAURANT"
          targetId={restaurant.id}
          showCount={true}
          initialCount={restaurant.favoriteCount || 0}
          variant="detail"
        />

        {score && (
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
            <div className="h-4 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-700">
              <FaStar className="text-[#fbbf24]" />
              <span>{score}</span>
            </div>
            {typeof restaurant?.reviewsCount === "number" && (
              <span className="text-gray-500 dark:text-gray-400 font-normal">{t("restaurant.reviews_count", { count: restaurant.reviewsCount })}</span>
            )}
          </div>
        )}
      </div>

      {/* Địa chỉ */}
      {address && (
        <div className="mt-2 flex items-start gap-2 text-[15px] text-gray-800 dark:text-gray-200">
          <FaMapMarkerAlt className="mt-0.5 shrink-0 text-gray-600 dark:text-gray-400" />
          <span>{address}</span>
        </div>
      )}

      {/* Loại hình + Ẩm thực */}
      {typeCuisine && (
        <div className="mt-2 flex items-start gap-2 text-[15px]">
          <FaFlag className="mt-0.5 shrink-0 text-gray-600 dark:text-gray-400" />
          <span>
            <span className="text-gray-700 dark:text-gray-300">{t("restaurant.type_label")}&nbsp;</span>
            <span className="font-medium text-rose-600">{typeCuisine}</span>
          </span>
        </div>
      )}

      {/* Khoảng giá */}
      {(minV || maxV || priceLevelSym) && (
        <div className="mt-2 flex items-start gap-2 text-[15px]">
          <FaDollarSign className="mt-0.5 shrink-0 text-gray-600 dark:text-gray-400" />
          <div className="flex flex-wrap items-center gap-2">
            {priceLevelSym && (
              <span className="text-amber-600 tracking-[2px]">
                {priceLevelSym}
              </span>
            )}
            {(minV || maxV) && (
              <span className="text-gray-800 dark:text-gray-200">
                <span className="text-gray-700 dark:text-gray-300">{t("restaurant.price_range_label")}&nbsp;</span>
                {minV ? `${minV}` : "—"}
                {minV || maxV ? " - " : ""}
                {maxV ? `${maxV}` : "—"}
                &nbsp;<span className="text-gray-500 dark:text-gray-400">{t("restaurant.price_per_person_unit")}</span>
              </span>
            )}
            {currency !== "VND" && (
              <span className="text-xs text-gray-500 dark:text-gray-400">({currency})</span>
            )}
          </div>
        </div>
      )}

      {/* Trạng thái mở cửa */}
      {openStatus?.label && (
        <div className="mt-2 flex items-start gap-2 text-[15px]">
          <FaClock className="mt-0.5 shrink-0 text-gray-600 dark:text-gray-400" />
          <span className={`font-medium ${openClass}`}>{openStatus.label}</span>
        </div>
      )}
    </section>
  );
}