// src/features/partner/components/hotel/crate/BasicInfoSection.jsx
import { useEffect, useMemo, useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { useTranslation } from "react-i18next";

// slugify tiếng Việt: bỏ dấu + chuẩn hóa a-z0-9-
function slugifyVN(input) {
  const s = (input || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "") // bỏ ký tự lạ
    .replace(/\s+/g, "-") // space -> -
    .replace(/-+/g, "-") // gộp 
    .replace(/^-+|-+$/g, ""); // bỏ - đầu/cuối
  return s;
}

function StarRating({ value, onChange }) {
  const { t } = useTranslation();
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="p-1 rounded-lg hover:bg-gray-50"
          aria-label={t("partner.basic_info.star_count", { n })}
          title={t("partner.basic_info.star_count", { n })}
        >
          <StarIcon className={`w-6 h-6 ${n <= value ? "text-yellow-500" : "text-gray-300"}`} />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">{value}/5</span>
    </div>
  );
}

export default function BasicInfoSection({ form, setField, disabled = false }) {
  const { t } = useTranslation();
  // If form mounts with an existing slug (edit mode), treat it as already user-controlled
  // so the auto-sync effect never silently rewrites a slug that public URLs depend on.
  const [slugTouched, setSlugTouched] = useState(() => Boolean(form?.slug));

  useEffect(() => {
    if (disabled) return;          //  readonly không auto-sync
    if (slugTouched) return;
    const auto = slugifyVN(form.name);
    if ((form.slug || "") !== auto) setField("slug", auto);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.name, slugTouched, disabled]);

  const onNameChange = (e) => {
    if (disabled) return;
    setField("name", e.target.value);
  };

  const onSlugChange = (e) => {
    if (disabled) return;
    setSlugTouched(true);
    setField("slug", e.target.value);
  };

  const regenerateSlug = () => {
    if (disabled) return;
    setSlugTouched(false);
    setField("slug", slugifyVN(form.name));
  };

  return (
    <details open className="group">
      <summary className="cursor-pointer select-none font-semibold">{t("partner.basic_info.title")}</summary>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm">
          <div className="font-medium mb-1">{t("partner.basic_info.name_label")}</div>
          <input
            value={form.name}
            onChange={onNameChange}
            className="w-full border rounded-xl px-3 py-2"
            placeholder={t("partner.basic_info.name_placeholder")}
            disabled={disabled}
          />
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1 flex items-center justify-between">
            <span>{t("partner.basic_info.slug_label")}</span>
            <button
              type="button"
              onClick={regenerateSlug}
              className="text-xs px-2 py-1 rounded-lg border hover:bg-gray-50 disabled:opacity-60"
              title={t("partner.basic_info.regenerate_slug_title")}
              disabled={disabled}
            >
              {t("partner.basic_info.regenerate_slug")}
            </button>
          </div>
          <input
            value={form.slug}
            onChange={onSlugChange}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="binh-an-hotel"
            disabled={disabled}
          />
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1">{t("partner.basic_info.star_rating_label")}</div>
          <div className="pointer-events-none opacity-90">
            <StarRating
              value={Number(form.starRating ?? 0)}
              onChange={() => {}}
            />
          </div>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            {t("partner.basic_info.star_rating_hint")}
          </div>
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1">{t("partner.basic_info.hotel_type_label")}</div>
          <select
            value={form.hotelType}
            onChange={(e) => !disabled && setField("hotelType", e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            disabled={disabled}
          >
            <option value="HOTEL">HOTEL</option>
            <option value="RESORT">RESORT</option>
            <option value="HOMESTAY">HOMESTAY</option>
            <option value="HOSTEL">HOSTEL</option>
            <option value="APARTMENT">APARTMENT</option>
            <option value="VILLA">VILLA</option>
            <option value="GUEST_HOUSE">GUEST_HOUSE</option>
            <option value="OTHER">OTHER</option>
          </select>
        </label>

        <label className="text-sm md:col-span-2">
          <div className="font-medium mb-1">{t("partner.basic_info.short_description_label")}</div>
          <input
            value={form.shortDescription}
            onChange={(e) => !disabled && setField("shortDescription", e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            disabled={disabled}
          />
        </label>

        <label className="text-sm md:col-span-2">
          <div className="font-medium mb-1">{t("partner.basic_info.description_label")}</div>
          <textarea
            value={form.description}
            onChange={(e) => !disabled && setField("description", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 min-h-[140px]"
            disabled={disabled}
          />
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1">Website</div>
          <input
            type="url"
            value={form.website || ""}
            onChange={(e) => !disabled && setField("website", e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="https://..."
            disabled={disabled}
          />
        </label>

        <label className="text-sm flex items-center gap-2 mt-6">
          <input
            type="checkbox"
            checked={!!form.hasOnlineCheckin}
            onChange={(e) => !disabled && setField("hasOnlineCheckin", e.target.checked)}
            disabled={disabled}
          />
          <span className="font-medium">{t("partner.basic_info.online_checkin_label")}</span>
        </label>
      </div>
    </details>
  );
}