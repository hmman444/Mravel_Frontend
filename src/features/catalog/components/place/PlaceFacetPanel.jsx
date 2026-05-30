import { useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import i18n from "../../../../i18n";

const PRICE_LEVEL_LABELS = {
  FREE: i18n.t("place.price_level_free"),
  CHEAP: i18n.t("place.price_level_cheap"),
  MODERATE: i18n.t("place.price_level_moderate"),
  EXPENSIVE: i18n.t("place.price_level_expensive"),
  LUXURY: i18n.t("place.price_level_luxury"),
};

const SECTION_CONFIG = {
  categories:  { title: i18n.t("place.section_categories"), collapsible: true },
  priceLevels: { title: i18n.t("place.section_price_levels") },
  venueTypes:  { title: i18n.t("place.section_venue_types") },
};

function getLabel(sectionKey, bucket) {
  if (sectionKey === "priceLevels") return PRICE_LEVEL_LABELS[bucket.slug] ?? bucket.name ?? bucket.slug;
  return bucket.name || bucket.slug;
}

function FacetSection({ sectionKey, buckets, selectedValues, isRadio, onChange }) {
  const { t } = useTranslation();
  const cfg = SECTION_CONFIG[sectionKey] ?? { title: sectionKey };
  const [expanded, setExpanded] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const visible = cfg.collapsible && !showAll ? buckets.slice(0, 5) : buckets;

  const toggle = (value) => {
    if (isRadio) {
      onChange(selectedValues === value ? null : value);
    } else {
      const arr = selectedValues || [];
      onChange(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 py-4">
      <button
        type="button"
        className="flex w-full items-center justify-between text-left"
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{cfg.title}</span>
        {expanded
          ? <FaChevronUp className="text-gray-400 text-xs" />
          : <FaChevronDown className="text-gray-400 text-xs" />}
      </button>

      {expanded && (
        <div className="mt-3 space-y-2">
          {visible.map((bucket) => {
            const checked = isRadio
              ? selectedValues === bucket.slug
              : (selectedValues || []).includes(bucket.slug);

            return (
              <label key={bucket.slug} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type={isRadio ? "radio" : "checkbox"}
                  checked={checked}
                  onChange={() => toggle(bucket.slug)}
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
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? t("place.collapse") : t("common.see_more_count", { count: buckets.length - 5 })}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Props:
 *   facets: { categories, priceLevels, venueTypes } — FacetBucket[]
 *   selectedFilters: { categorySlugs: string[], priceLevel: string|null }
 *   onChange: (newFilters) => void
 */
export default function PlaceFacetPanel({ facets, selectedFilters, onChange }) {
  const { t } = useTranslation();
  if (!facets) return null;

  const hasFilters =
    (selectedFilters.categorySlugs?.length ?? 0) > 0 ||
    selectedFilters.priceLevel != null ||
    (selectedFilters.venueTypes?.length ?? 0) > 0;

  const sectionMeta = [
    { key: "categories",  facetKey: "categories",  filterKey: "categorySlugs", isRadio: false, selected: selectedFilters.categorySlugs },
    { key: "priceLevels", facetKey: "priceLevels",  filterKey: "priceLevel",    isRadio: true,  selected: selectedFilters.priceLevel },
    { key: "venueTypes",  facetKey: "venueTypes",   filterKey: "venueTypes",    isRadio: false, selected: selectedFilters.venueTypes ?? [] },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-base text-gray-900 dark:text-gray-100">{t("place.filters")}</h3>
        {hasFilters && (
          <button
            type="button"
            className="text-xs text-blue-600 hover:underline"
            onClick={() => onChange({ categorySlugs: [], priceLevel: null, venueTypes: [] })}
          >
            {t("place.clear_filters")}
          </button>
        )}
      </div>

      {sectionMeta.map(({ key, facetKey, filterKey, isRadio, selected }) => {
        const buckets = facets[facetKey];
        if (!buckets || buckets.length === 0) return null;

        return (
          <FacetSection
            key={key}
            sectionKey={key}
            buckets={buckets}
            selectedValues={selected}
            isRadio={isRadio}
            onChange={(value) => onChange({ ...selectedFilters, [filterKey]: value })}
          />
        );
      })}
    </div>
  );
}
