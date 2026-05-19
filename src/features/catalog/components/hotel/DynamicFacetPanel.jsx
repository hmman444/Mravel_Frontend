import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

const PRICE_RANGE_LABELS = {
  UNDER_500K: "Dưới 500.000đ",
  "500K_1M": "500.000đ – dưới 1.000.000đ",
  "1M_2M": "1.000.000đ – dưới 2.000.000đ",
  OVER_2M: "Từ 2.000.000đ trở lên",
};

const HOTEL_TYPE_LABELS = {
  HOTEL: "Khách sạn",
  RESORT: "Resort",
  HOMESTAY: "Homestay",
  HOSTEL: "Hostel",
  VILLA: "Villa",
  APARTMENT: "Căn hộ",
};

const SECTION_CONFIG = {
  starRatings: { title: "Hạng sao", type: "multi" },
  hotelTypes: { title: "Loại chỗ ở", type: "multi" },
  amenities: { title: "Tiện nghi", type: "multi", collapsible: true },
  priceRanges: { title: "Khoảng giá", type: "single" },
};

function getLabel(sectionKey, bucket) {
  if (sectionKey === "priceRanges") return PRICE_RANGE_LABELS[bucket.value] ?? bucket.label ?? bucket.value;
  if (sectionKey === "hotelTypes") return HOTEL_TYPE_LABELS[bucket.value] ?? bucket.label ?? bucket.value;
  return bucket.label || bucket.value;
}

function FacetSection({ sectionKey, buckets, selectedValues, isRadio, onChange }) {
  const cfg = SECTION_CONFIG[sectionKey] ?? { title: sectionKey };
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const visible = cfg.collapsible && !showAll ? buckets.slice(0, 5) : buckets;

  const toggle = (value) => {
    if (isRadio) {
      onChange(selectedValues === value ? null : value);
    } else {
      const arr = selectedValues || [];
      onChange(arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]);
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 py-4">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={() => setExpanded(v => !v)}
      >
        <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{cfg.title}</span>
        {expanded ? <FaChevronUp className="text-gray-400 text-xs" /> : <FaChevronDown className="text-gray-400 text-xs" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {visible.map((bucket) => {
            const checked = isRadio
              ? selectedValues === bucket.value
              : (selectedValues || []).includes(bucket.value);

            return (
              <label key={bucket.value} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type={isRadio ? "radio" : "checkbox"}
                  checked={checked}
                  onChange={() => toggle(bucket.value)}
                  className="accent-[#ff6a00] shrink-0"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 flex-1 leading-snug">
                  {getLabel(sectionKey, bucket)}
                </span>
                <span className="text-xs text-gray-400 shrink-0">({bucket.count})</span>
              </label>
            );
          })}

          {cfg.collapsible && buckets.length > 5 && (
            <button
              type="button"
              className="text-xs text-blue-600 hover:underline mt-1"
              onClick={() => setShowAll(v => !v)}
            >
              {showAll ? "Thu gọn" : `Xem thêm (${buckets.length - 5})`}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Props:
 *   facets: { starRatings, hotelTypes, amenities, priceRanges } — FacetBucket[]
 *   selectedFilters: { starRatings: string[], hotelTypes: string[], amenities: string[], priceRange: string|null }
 *   onChange: (newFilters) => void
 */
export default function DynamicFacetPanel({ facets, selectedFilters, onChange }) {
  if (!facets) return null;

  const sections = ["starRatings", "priceRanges", "hotelTypes", "amenities"];

  const update = (key, value) => onChange({ ...selectedFilters, [key]: value });

  const hasFilters =
    selectedFilters.starRatings.length > 0 ||
    selectedFilters.hotelTypes.length > 0 ||
    selectedFilters.amenities.length > 0 ||
    selectedFilters.priceRange != null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">Bộ lọc</h3>
        {hasFilters && (
          <button
            type="button"
            className="text-xs text-blue-600 hover:underline"
            onClick={() => onChange({ starRatings: [], hotelTypes: [], amenities: [], priceRange: null })}
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {facets.facetErrors && Object.keys(facets.facetErrors).length > 0 && (
        <div className="mb-3 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          Một số bộ lọc tạm thời không khả dụng.
        </div>
      )}

      {sections.map((key) => {
        const buckets = facets[key];
        if (!buckets || buckets.length === 0) return null;
        const isRadio = key === "priceRanges";
        const selected = isRadio ? selectedFilters.priceRange : selectedFilters[key];

        return (
          <FacetSection
            key={key}
            sectionKey={key}
            buckets={buckets}
            selectedValues={selected}
            isRadio={isRadio}
            onChange={(value) => update(isRadio ? "priceRange" : key, value)}
          />
        );
      })}
    </div>
  );
}
