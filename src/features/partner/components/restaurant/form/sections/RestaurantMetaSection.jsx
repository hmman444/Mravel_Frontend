import { useMemo } from "react";

const PRICE_LEVEL_OPTIONS = [
  { value: "", label: "— Chọn mức giá —" },
  { value: "CHEAP", label: "Rẻ" },
  { value: "MODERATE", label: "Trung bình" },
  { value: "EXPENSIVE", label: "Cao" },
  { value: "LUXURY", label: "Sang trọng" },
];

// Bạn sửa các value cho khớp enum BE thật
const PRICE_BUCKET_OPTIONS = [
  { value: "", label: "— Chọn nhóm giá —" },
  { value: "UNDER_100K", label: "Dưới 100k/người" },
  { value: "FROM_100K_TO_150K", label: "100k–150k/người" },
  { value: "FROM_150K_TO_250K", label: "150k–250k/người" },
  { value: "FROM_250K_TO_400K", label: "250k–400k/người" },
  { value: "FROM_400K_TO_500K", label: "400k–500k/người" },
  { value: "OVER_500K", label: "Trên 500k/người" },
];

export default function RestaurantMetaSection({ form, setField, disabled }) {
  const priceHint = useMemo(() => {
    const min = form.minPrice || "";
    const max = form.maxPrice || "";
    if (!min && !max) {
      return "Gợi ý: Bạn có thể nhập giá min/max để hệ thống (backend) tự suy ra nhóm giá (nếu backend có hỗ trợ).";
    }
  }, [form.minPrice, form.maxPrice]);

  return (
    <details className="group">
      <summary className="cursor-pointer select-none font-semibold">Phân loại & cấu hình giá</summary>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm">
          <div className="font-medium mb-1">Loại nhà hàng</div>
          <input
            value={form.restaurantType || ""}
            onChange={(e) => setField("restaurantType", e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="Ví dụ: BUFFET_VA_GOI_MON"
            disabled={disabled}
          />
          <div className="text-[11px] text-gray-500 mt-1">Nhập đúng enum backend.</div>
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1">Trang Facebook</div>
          <input
            value={form.facebookPage || ""}
            onChange={(e) => setField("facebookPage", e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="https://facebook.com/..."
            disabled={disabled}
          />
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1">Hotline đặt bàn</div>
          <input
            value={form.bookingHotline || ""}
            onChange={(e) => setField("bookingHotline", e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="1900xxxxxx"
            disabled={disabled}
          />
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1">Loại tiền tệ</div>
          <input
            value={form.currencyCode || "VND"}
            onChange={(e) => setField("currencyCode", e.target.value)}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="VND"
            disabled={disabled}
          />
          <div className="text-[11px] text-gray-500 mt-1">Thường dùng: VND.</div>
        </label>

        {/* Mức giá: dropdown tiếng Việt, value là enum */}
        <label className="text-sm">
          <div className="font-medium mb-1">Mức giá</div>
          <select
            value={form.priceLevel || ""}
            onChange={(e) => setField("priceLevel", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 bg-white"
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
          <div className="font-medium mb-1">Nhóm giá</div>
          <select
            value={form.priceBucket || ""}
            onChange={(e) => setField("priceBucket", e.target.value)}
            className="w-full border rounded-xl px-3 py-2 bg-white"
            disabled={disabled}
          >
            {PRICE_BUCKET_OPTIONS.map((opt) => (
              <option key={opt.value || "__empty"} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="text-[11px] text-gray-500 mt-1">{priceHint}</div>
        </label>
      </div>
    </details>
  );
}