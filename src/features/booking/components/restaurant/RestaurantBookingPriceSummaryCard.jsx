import { useMemo } from "react";
import { Tag } from "lucide-react";

const safeNum = (v) => (typeof v === "number" && !Number.isNaN(v) ? v : 0);

export default function RestaurantBookingPriceSummaryCard({
  tableTypeName = "Bàn 2",
  depositPerTable = 0,
  tablesCount = 1,
  currency = "VND",
  onPay,
  disabled = false,
  loading = false,

  holdMinutes, // optional
}) {
  const total = useMemo(() => {
    const dep = safeNum(depositPerTable);
    const n = Math.max(1, Number(tablesCount || 1));
    return Math.round(dep * n);
  }, [depositPerTable, tablesCount]);

  const formattedDep = Math.round(safeNum(depositPerTable)).toLocaleString("vi-VN");
  const formattedTotal = total.toLocaleString("vi-VN");

  return (
    <section className="rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 md:px-5">
        <div className="flex items-center gap-2">
          <Tag className="h-4 w-4 text-gray-700" />
          <h2 className="text-sm font-semibold text-gray-900 md:text-base">
            Chi tiết cọc giữ bàn
          </h2>
        </div>
        <span className="text-[11px] text-gray-500">Hình thức: Đặt cọc</span>
      </div>

      <div className="space-y-3 px-4 pb-4 pt-3 md:px-5 md:pb-5">
        <div className="space-y-2 text-xs text-gray-800 md:text-sm">
          <div className="flex items-center justify-between">
            <span>Tiền cọc</span>
            <span>{formattedDep} {currency}/bàn</span>
          </div>
          <div className="flex items-center justify-between text-gray-600">
            <span>
              ({tablesCount}x) {tableTypeName}
            </span>
            <span className="font-semibold">{formattedTotal} {currency}</span>
          </div>
        </div>

        <div className="mt-2 space-y-1 border-t border-dashed border-gray-200 pt-3">
          <p className="text-xs text-gray-600 md:text-sm">Tổng tiền cọc cần thanh toán</p>
          <p className="text-lg font-bold text-emerald-600 md:text-xl">
            {formattedTotal} {currency}
          </p>

          {holdMinutes ? (
            <p className="text-[11px] text-gray-500">
              Giữ bàn trong <span className="font-semibold">{holdMinutes}</span> phút từ giờ đã chọn (tuỳ nhà hàng).
            </p>
          ) : (
            <p className="text-[11px] text-gray-500">
              Khoản cọc dùng để giữ bàn đúng khung giờ. Phần còn lại thanh toán tại nhà hàng.
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={disabled || loading}
          onClick={() => onPay?.()}
          className={[
            "mt-3 inline-flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition",
            disabled || loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#007bff] hover:bg-[#ff6b1a]",
          ].join(" ")}
        >
          {loading ? "Đang chuyển đến MoMo..." : "Thanh toán đặt cọc"}
        </button>

        <p className="mt-2 text-[11px] leading-snug text-gray-500">
          Bằng cách tiếp tục thanh toán, bạn đồng ý với{" "}
          <span className="cursor-pointer text-blue-600 hover:underline">
            Điều khoản &amp; Điều kiện
          </span>
          ,{" "}
          <span className="cursor-pointer text-blue-600 hover:underline">
            Chính sách Bảo mật
          </span>{" "}
          của Mravel.
        </p>
      </div>
    </section>
  );
}