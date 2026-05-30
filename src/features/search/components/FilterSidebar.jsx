import { useState } from "react";
import { useTranslation } from "react-i18next";
import FilterCard from "./FilterCard";

export default function FilterSidebar() {
  const { t } = useTranslation();
  const [price, setPrice] = useState([0, 2000000]);

  return (
    <aside className="w-72 space-y-4">
      <FilterCard title={t("search.price_range")}>
        <input
          type="range"
          min="0"
          max="10000000"
          step="500000"
          value={price[1]}
          onChange={(e) => setPrice([0, Number(e.target.value)])}
          className="w-full"
        />
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          0 ₫ - {price[1].toLocaleString()} ₫
        </p>
      </FilterCard>

      {/* Lọc phổ biến */}
      <FilterCard title={t("search.popular_filters")}>
        <div className="flex flex-col gap-2">
          <label><input type="checkbox" /> {t("search.filter_breakfast")}</label>
          <label><input type="checkbox" /> {t("search.filter_good_4_5_star")}</label>
          <label><input type="checkbox" /> {t("search.filter_convenient_location")}</label>
          <label><input type="checkbox" /> {t("search.filter_family")}</label>
          <label><input type="checkbox" /> {t("search.filter_near_beach")}</label>
          <button className="text-blue-600 text-xs font-medium mt-1">{t("search.see_all")}</button>
        </div>
      </FilterCard>

      {/* Đánh giá sao */}
      <FilterCard title={t("search.star_rating")}>
        <div className="flex flex-col gap-2">
          {[5, 4, 3].map((star) => (
            <label key={star}>
              <input type="checkbox" /> {star} ⭐
            </label>
          ))}
        </div>
      </FilterCard>
    </aside>
  );
}
