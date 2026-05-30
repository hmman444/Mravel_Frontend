// src/features/partner/components/restaurant/form/sections/BasicInfoSection.jsx
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { slugifyVN } from "../../../../utils/restaurantFormUtils";

export default function BasicInfoSection({ form, setField, disabled }) {
  const { t } = useTranslation();
  // If form mounts with an existing slug (edit mode), treat it as already user-controlled
  // so the auto-sync effect never silently rewrites a slug that public URLs depend on.
  const [slugTouched, setSlugTouched] = useState(() => Boolean(form?.slug));

  useEffect(() => {
    if (slugTouched) return;
    const auto = slugifyVN(form.name);
    if ((form.slug || "") !== auto) setField("slug", auto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name, slugTouched]);

  const descMax = 500;
  const descLen = useMemo(() => String(form.description || "").length, [form.description]);

  const priceRangeInvalid = useMemo(() => {
    const min = Number(form.minPrice);
    const max = Number(form.maxPrice);
    return (
      Number.isFinite(min) && Number.isFinite(max) && min > 0 && max > 0 && min > max
    );
  }, [form.minPrice, form.maxPrice]);

  return (
    <details open className="group">
      <summary className="cursor-pointer select-none font-semibold">{t("partner.restaurant_form.basic_info")}</summary>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm">
          <div className="font-medium mb-1">{t("partner.restaurant_form.name_label")}</div>
          <input
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            placeholder={t("partner.restaurant_form.name_placeholder")}
            disabled={disabled}
          />
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1 flex items-center justify-between">
            <span>{t("partner.restaurant_form.slug_label")}</span>
            <button
              type="button"
              onClick={() => {
                setSlugTouched(false);
                setField("slug", slugifyVN(form.name));
              }}
              className="text-xs px-2 py-1 rounded-lg border hover:bg-gray-50"
              disabled={disabled}
            >
              {t("partner.restaurant_form.regenerate")}
            </button>
          </div>
          <input
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              setField("slug", e.target.value);
            }}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="bun-cha-ha-noi"
            disabled={disabled}
          />
        </label>

        <label className="text-sm md:col-span-2">
          <div className="font-medium mb-1">{t("partner.restaurant_form.short_description")}</div>
          <input
            value={form.shortDescription}
            onChange={(e) => setField("shortDescription", e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            disabled={disabled}
          />
        </label>

        <label className="text-sm md:col-span-2">
          <div className="font-medium mb-1">{t("partner.restaurant_form.description")}</div>
          <textarea
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 min-h-[140px]"
            maxLength={descMax}
            placeholder={t("partner.restaurant_form.description_placeholder")}
            disabled={disabled}
          />
          <div className="mt-1 flex justify-end">
            <span className="text-xs text-gray-500 dark:text-gray-400">{descLen}/{descMax}</span>
          </div>
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1">{t("partner.restaurant_form.min_price_label")}</div>
          <input
            inputMode="decimal"
            value={form.minPrice}
            onChange={(e) => setField("minPrice", e.target.value.replace(/[^\d.]/g, ""))}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="50000"
            disabled={disabled}
          />
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1">{t("partner.restaurant_form.max_price_label")}</div>
          <input
            inputMode="decimal"
            value={form.maxPrice}
            onChange={(e) => setField("maxPrice", e.target.value.replace(/[^\d.]/g, ""))}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="300000"
            disabled={disabled}
          />
        </label>

        {priceRangeInvalid && (
          <div className="md:col-span-2 text-xs text-red-600">
            {t("partner.restaurant_form.price_range_invalid")}
          </div>
        )}
      </div>
    </details>
  );
}