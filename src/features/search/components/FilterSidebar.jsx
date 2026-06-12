import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import FilterCard from "./FilterCard";

export default function FilterSidebar({ onFilter }) {
  const { t } = useTranslation();
  const [maxPrice, setMaxPrice] = useState(2000000);
  const [popular, setPopular] = useState({});
  const [stars, setStars] = useState([]);
  const [showAll, setShowAll] = useState(false);

  const popularFilters = [
    "filter_breakfast",
    "filter_good_4_5_star",
    "filter_convenient_location",
    "filter_family",
    "filter_near_beach",
  ];
  const visiblePopular = showAll ? popularFilters : popularFilters.slice(0, 3);

  useEffect(() => {
    onFilter?.({ maxPrice, stars });
  }, [maxPrice, stars, onFilter]);

  const togglePopular = (key) =>
    setPopular((prev) => ({ ...prev, [key]: !prev[key] }));

  const toggleStar = (star) =>
    setStars((prev) =>
      prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star]
    );

  return (
    <aside className="w-72 space-y-4">
      <FilterCard title={t("search.price_range")}>
        <input
          type="range"
          min="0"
          max="10000000"
          step="500000"
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="w-full"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          0 ₫ - {maxPrice.toLocaleString()} ₫
        </p>
      </FilterCard>

      {/* Lọc phổ biến */}
      <FilterCard title={t("search.popular_filters")}>
        <div className="flex flex-col gap-2">
          {visiblePopular.map((key) => (
            <label key={key}>
              <input
                type="checkbox"
                checked={!!popular[key]}
                onChange={() => togglePopular(key)}
              />{" "}
              {t(`search.${key}`)}
            </label>
          ))}
          <button
            type="button"
            onClick={() => setShowAll((prev) => !prev)}
            className="text-blue-600 text-xs font-medium mt-1"
          >
            {t("search.see_all")}
          </button>
        </div>
      </FilterCard>

      {/* Đánh giá sao */}
      <FilterCard title={t("search.star_rating")}>
        <div className="flex flex-col gap-2">
          {[5, 4, 3].map((star) => (
            <label key={star}>
              <input
                type="checkbox"
                checked={stars.includes(star)}
                onChange={() => toggleStar(star)}
              />{" "}
              {star} ⭐
            </label>
          ))}
        </div>
      </FilterCard>
    </aside>
  );
}
