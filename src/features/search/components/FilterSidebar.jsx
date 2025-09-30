import { useState } from "react";
import FilterCard from "./FilterCard";

export default function FilterSidebar() {
  const [price, setPrice] = useState([0, 2000000]);

  return (
    <aside className="w-72 space-y-4">
      <FilterCard title="Khoảng giá">
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
      <FilterCard title="Lọc phổ biến">
        <div className="flex flex-col gap-2">
          <label><input type="checkbox" /> Có bữa sáng</label>
          <label><input type="checkbox" /> 4-5 sao giá tốt</label>
          <label><input type="checkbox" /> Vị trí thuận tiện</label>
          <label><input type="checkbox" /> Phù hợp cho gia đình</label>
          <label><input type="checkbox" /> Gần biển</label>
          <button className="text-blue-600 text-xs font-medium mt-1">Xem tất cả</button>
        </div>
      </FilterCard>

      {/* Đánh giá sao */}
      <FilterCard title="Đánh giá sao">
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
