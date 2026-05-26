// src/features/partner/components/restaurant/form/sections/BasicInfoSection.jsx
import { useEffect, useMemo, useState } from "react";
import { slugifyVN } from "../../../../utils/restaurantFormUtils";

export default function BasicInfoSection({ form, setField, disabled }) {
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
      <summary className="cursor-pointer select-none font-semibold">Thông tin cơ bản</summary>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm">
          <div className="font-medium mb-1">Tên quán *</div>
          <input
            value={form.name}
            onChange={(e) => setField("name", e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="Ví dụ: Bún chả Hà Nội"
            disabled={disabled}
          />
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1 flex items-center justify-between">
            <span>Slug</span>
            <button
              type="button"
              onClick={() => {
                setSlugTouched(false);
                setField("slug", slugifyVN(form.name));
              }}
              className="text-xs px-2 py-1 rounded-lg border hover:bg-gray-50"
              disabled={disabled}
            >
              Tạo lại
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
          <div className="font-medium mb-1">Mô tả ngắn</div>
          <input
            value={form.shortDescription}
            onChange={(e) => setField("shortDescription", e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            disabled={disabled}
          />
        </label>

        <label className="text-sm md:col-span-2">
          <div className="font-medium mb-1">Mô tả</div>
          <textarea
            value={form.description}
            onChange={(e) => setField("description", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 min-h-[140px]"
            maxLength={descMax}
            placeholder="Giới thiệu về quán, món nổi bật..."
            disabled={disabled}
          />
          <div className="mt-1 flex justify-end">
            <span className="text-xs text-gray-500 dark:text-gray-400">{descLen}/{descMax}</span>
          </div>
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1">Giá tối thiểu (Tham khảo)</div>
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
          <div className="font-medium mb-1">Giá tối đa (Tham khảo)</div>
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
            Giá tối thiểu đang lớn hơn giá tối đa. Vui lòng kiểm tra lại.
          </div>
        )}
      </div>
    </details>
  );
}