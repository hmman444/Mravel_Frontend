// src/features/partner/components/hotel/crate/BasicInfoSection.jsx
import { useEffect, useMemo, useState } from "react";
import { StarIcon } from "@heroicons/react/24/solid";

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
    .replace(/-+/g, "-") // gộp ---
    .replace(/^-+|-+$/g, ""); // bỏ - đầu/cuối
  return s;
}

function StarRating({ value, onChange }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-1">
      {stars.map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className="p-1 rounded-lg hover:bg-gray-50"
          aria-label={`${n} sao`}
          title={`${n} sao`}
        >
          <StarIcon className={`w-6 h-6 ${n <= value ? "text-yellow-500" : "text-gray-300"}`} />
        </button>
      ))}
      <span className="ml-2 text-sm text-gray-600">{value}/5</span>
    </div>
  );
}

export default function BasicInfoSection({ form, setField, disabled = false }) {
  const [slugTouched, setSlugTouched] = useState(false);

  useEffect(() => {
    if (disabled) return;          // ✅ readonly không auto-sync
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
      <summary className="cursor-pointer select-none font-semibold">Thông tin cơ bản</summary>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm">
          <div className="font-medium mb-1">Tên *</div>
          <input
            value={form.name}
            onChange={onNameChange}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="Ví dụ: Bình An Hotel"
            disabled={disabled}
          />
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1 flex items-center justify-between">
            <span>Slug *</span>
            <button
              type="button"
              onClick={regenerateSlug}
              className="text-xs px-2 py-1 rounded-lg border hover:bg-gray-50 disabled:opacity-60"
              title="Tạo lại slug từ tên"
              disabled={disabled}
            >
              Tạo lại
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
          <div className="font-medium mb-1">Hạng sao</div>
          <div className={disabled ? "pointer-events-none opacity-90" : ""}>
            <StarRating
              value={Number(form.starRating ?? 1)}
              onChange={(n) => !disabled && setField("starRating", n)}
            />
          </div>
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1">Loại khách sạn</div>
          <select
            value={form.hotelType}
            onChange={(e) => !disabled && setField("hotelType", e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            disabled={disabled}
          >
            <option value="HOTEL">HOTEL</option>
            <option value="RESORT">RESORT</option>
            <option value="HOMESTAY">HOMESTAY</option>
            <option value="APARTMENT">APARTMENT</option>
            <option value="VILLA">VILLA</option>
            <option value="OTHER">OTHER</option>
          </select>
        </label>

        <label className="text-sm md:col-span-2">
          <div className="font-medium mb-1">Mô tả ngắn</div>
          <input
            value={form.shortDescription}
            onChange={(e) => !disabled && setField("shortDescription", e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            disabled={disabled}
          />
        </label>

        <label className="text-sm md:col-span-2">
          <div className="font-medium mb-1">Mô tả</div>
          <textarea
            value={form.description}
            onChange={(e) => !disabled && setField("description", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 min-h-[140px]"
            maxLength={200}
            placeholder="Tối đa 200 ký tự..."
            disabled={disabled}
          />
        </label>
      </div>
    </details>
  );
}