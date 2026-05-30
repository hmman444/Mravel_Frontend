import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const buildPriceLevelOptions = (t) => [
  { value: "", label: t("partner.restaurant_meta.price_level_placeholder") },
  { value: "CHEAP", label: t("partner.restaurant_meta.price_level.cheap") },
  { value: "MODERATE", label: t("partner.restaurant_meta.price_level.moderate") },
  { value: "EXPENSIVE", label: t("partner.restaurant_meta.price_level.expensive") },
  { value: "LUXURY", label: t("partner.restaurant_meta.price_level.luxury") },
];

// Bạn sửa các value cho khớp enum BE thật
const buildPriceBucketOptions = (t) => [
  { value: "", label: t("partner.restaurant_meta.price_bucket_placeholder") },
  { value: "UNDER_100K", label: t("partner.restaurant_meta.price_bucket.under_100k") },
  { value: "FROM_100K_TO_150K", label: t("partner.restaurant_meta.price_bucket.from_100k_to_150k") },
  { value: "FROM_150K_TO_250K", label: t("partner.restaurant_meta.price_bucket.from_150k_to_250k") },
  { value: "FROM_250K_TO_400K", label: t("partner.restaurant_meta.price_bucket.from_250k_to_400k") },
  { value: "FROM_400K_TO_500K", label: t("partner.restaurant_meta.price_bucket.from_400k_to_500k") },
  { value: "OVER_500K", label: t("partner.restaurant_meta.price_bucket.over_500k") },
];

export default function RestaurantMetaSection({ form, setField, disabled }) {
  const { t } = useTranslation();
  const PRICE_LEVEL_OPTIONS = useMemo(() => buildPriceLevelOptions(t), [t]);
  const PRICE_BUCKET_OPTIONS = useMemo(() => buildPriceBucketOptions(t), [t]);

  const priceHint = useMemo(() => {
    const min = form.minPrice || "";
    const max = form.maxPrice || "";
    if (!min && !max) {
      return t("partner.restaurant_meta.price_hint");
    }
  }, [form.minPrice, form.maxPrice, t]);

  return (
    <details className="group">
      <summary className="cursor-pointer select-none font-semibold">{t("partner.restaurant_meta.section_title")}</summary>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm">
          <div className="font-medium mb-1">{t("partner.restaurant_meta.restaurant_type_label")}</div>
          <input
            value={form.restaurantType || ""}
            onChange={(e) => setField("restaurantType", e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            placeholder={t("partner.restaurant_meta.restaurant_type_placeholder")}
            disabled={disabled}
          />
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{t("partner.restaurant_meta.restaurant_type_hint")}</div>
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1">{t("partner.restaurant_meta.facebook_page_label")}</div>
          <input
            value={form.facebookPage || ""}
            onChange={(e) => setField("facebookPage", e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="https://facebook.com/..."
            disabled={disabled}
          />
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1">{t("partner.restaurant_meta.booking_hotline_label")}</div>
          <input
            value={form.bookingHotline || ""}
            onChange={(e) => setField("bookingHotline", e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="1900xxxxxx"
            disabled={disabled}
          />
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1">{t("partner.restaurant_meta.currency_label")}</div>
          <input
            value={form.currencyCode || "VND"}
            onChange={(e) => setField("currencyCode", e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="VND"
            disabled={disabled}
          />
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{t("partner.restaurant_meta.currency_hint")}</div>
        </label>

        {/* Mức giá: dropdown tiếng Việt, value là enum */}
        <label className="text-sm">
          <div className="font-medium mb-1">{t("partner.restaurant_meta.price_level_label")}</div>
          <select
            value={form.priceLevel || ""}
            onChange={(e) => setField("priceLevel", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 bg-white dark:bg-gray-800"
            disabled={disabled}
          >
            {PRICE_LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value || "__empty"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        {/* Nhóm giá: dropdown tiếng Việt, value là enum */}
        <label className="text-sm">
          <div className="font-medium mb-1">{t("partner.restaurant_meta.price_bucket_label")}</div>
          <select
            value={form.priceBucket || ""}
            onChange={(e) => setField("priceBucket", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 bg-white dark:bg-gray-800"
            disabled={disabled}
          >
            {PRICE_BUCKET_OPTIONS.map((opt) => (
              <option key={opt.value || "__empty"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1">{priceHint}</div>
        </label>
      </div>
    </details>
  );
}