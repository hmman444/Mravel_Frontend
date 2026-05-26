// src/features/partner/components/restaurant/form/sections/ParkingSection.jsx
const sanitizeNumberStr = (v) => {
  const s = String(v ?? "").replace(/[^\d.]/g, "");
  const firstDot = s.indexOf(".");
  if (firstDot !== -1) return s.slice(0, firstDot + 1) + s.slice(firstDot + 1).replace(/\./g, "");
  return s;
};

const FEE_TYPES = [
  { value: "", label: "-- Chọn --" },
  { value: "FREE", label: "Miễn phí" },
  { value: "PAID", label: "Có thu phí" },
  { value: "UNKNOWN", label: "Không rõ" },
];

export default function ParkingSection({ form, setField, disabled }) {
  const p = form.parking || {};
  const update = (patch) => setField("parking", { ...p, ...patch });

  return (
    <details className="group">
      <summary className="cursor-pointer select-none font-semibold">
        Đỗ xe
      </summary>

      <div className="mt-3 space-y-5">
        {/* === Xe ô tô === */}
        <div className="rounded-2xl border p-4 space-y-3">
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!p.hasCarParking}
              onChange={(e) => update({ hasCarParking: e.target.checked })}
              disabled={disabled}
            />
            <span className="font-medium">Có chỗ đỗ ô tô</span>
          </label>

          {p.hasCarParking && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="text-sm md:col-span-2">
                <div className="font-medium mb-1">Vị trí đỗ xe ô tô</div>
                <input
                  value={p.carParkingLocation ?? ""}
                  onChange={(e) => update({ carParkingLocation: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder="Ví dụ: Bãi đỗ xe trong khuôn viên"
                  disabled={disabled}
                />
              </label>

              <label className="text-sm">
                <div className="font-medium mb-1">Loại phí</div>
                <select
                  value={p.carParkingFeeType ?? ""}
                  onChange={(e) => update({ carParkingFeeType: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 bg-white dark:bg-gray-900"
                  disabled={disabled}
                >
                  {FEE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </label>

              {p.carParkingFeeType === "PAID" && (
                <label className="text-sm">
                  <div className="font-medium mb-1">Mức phí (VND)</div>
                  <input
                    inputMode="decimal"
                    value={p.carParkingFeeAmount ?? ""}
                    onChange={(e) => update({ carParkingFeeAmount: sanitizeNumberStr(e.target.value) })}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="Ví dụ: 20000"
                    disabled={disabled}
                  />
                </label>
              )}
            </div>
          )}
        </div>

        {/* === Xe máy === */}
        <div className="rounded-2xl border p-4 space-y-3">
          <label className="text-sm flex items-center gap-2">
            <input
              type="checkbox"
              checked={!!p.hasMotorbikeParking}
              onChange={(e) => update({ hasMotorbikeParking: e.target.checked })}
              disabled={disabled}
            />
            <span className="font-medium">Có chỗ đỗ xe máy</span>
          </label>

          {p.hasMotorbikeParking && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <label className="text-sm md:col-span-2">
                <div className="font-medium mb-1">Vị trí đỗ xe máy</div>
                <input
                  value={p.motorbikeParkingLocation ?? ""}
                  onChange={(e) => update({ motorbikeParkingLocation: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2"
                  placeholder="Ví dụ: Bãi đỗ xe trong khuôn viên"
                  disabled={disabled}
                />
              </label>

              <label className="text-sm">
                <div className="font-medium mb-1">Loại phí</div>
                <select
                  value={p.motorbikeParkingFeeType ?? ""}
                  onChange={(e) => update({ motorbikeParkingFeeType: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 bg-white dark:bg-gray-900"
                  disabled={disabled}
                >
                  {FEE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </label>

              {p.motorbikeParkingFeeType === "PAID" && (
                <label className="text-sm">
                  <div className="font-medium mb-1">Mức phí (VND)</div>
                  <input
                    inputMode="decimal"
                    value={p.motorbikeParkingFeeAmount ?? ""}
                    onChange={(e) => update({ motorbikeParkingFeeAmount: sanitizeNumberStr(e.target.value) })}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="Ví dụ: 5000"
                    disabled={disabled}
                  />
                </label>
              )}
            </div>
          )}
        </div>

        {/* === Ghi chú chung === */}
        <label className="text-sm block">
          <div className="font-medium mb-1">Ghi chú đỗ xe</div>
          <textarea
            value={p.notes ?? ""}
            onChange={(e) => update({ notes: e.target.value })}
            className="w-full border rounded-xl px-3 py-2 min-h-[80px]"
            placeholder="Ví dụ: Có bảo vệ hướng dẫn, miễn phí cho khách đặt bàn."
            disabled={disabled}
          />
        </label>
      </div>
    </details>
  );
}
