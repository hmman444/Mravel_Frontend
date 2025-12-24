// src/features/partner/components/restaurant/form/sections/BookingConfigSection.jsx
const asString = (v) => (v == null ? "" : String(v));
const toIntStr = (v) => asString(v).replace(/[^\d]/g, "");

export default function BookingConfigSection({ form, setField, disabled }) {
  const cfg = form.bookingConfig || {};

  const setCfg = (patch) => setField("bookingConfig", { ...cfg, ...(patch || {}) });

  return (
    <details className="group">
      <summary className="cursor-pointer select-none font-semibold">
        Cấu hình thông tin đặt bàn
      </summary>

      <div className="mt-3 rounded-2xl border p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <label className="md:col-span-4 text-sm">
            <div className="font-medium mb-1">Bước thời gian (phút)</div>
            <input
              inputMode="numeric"
              value={asString(cfg.slotMinutes)}
              onChange={(e) => setCfg({ slotMinutes: toIntStr(e.target.value) })}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="15"
              disabled={disabled}
            />
            <div className="text-[11px] text-gray-400 mt-1">
              Ví dụ: 15 = mỗi 15 phút tạo 1 khung giờ.
            </div>
          </label>

          <label className="md:col-span-8 text-sm">
            <div className="font-medium mb-1">Thời lượng cho phép (phút)</div>
            <input
              value={Array.isArray(cfg.allowedDurationsMinutes) ? cfg.allowedDurationsMinutes.join(", ") : ""}
              onChange={(e) =>
                setCfg({
                  allowedDurationsMinutes: e.target.value
                    .split(/[,\s]+/g)
                    .map((x) => Number(x))
                    .filter((n) => Number.isFinite(n))
                    .map((n) => Math.trunc(n)),
                })
              }
              className="w-full border rounded-xl px-3 py-2"
              placeholder="60, 90, 120"
              disabled={disabled}
            />
            <div className="text-[11px] text-gray-400 mt-1">Nhập dạng: 60, 90, 120 (phút).</div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <label className="md:col-span-4 text-sm">
            <div className="font-medium mb-1">Thời lượng mặc định (phút)</div>
            <input
              inputMode="numeric"
              value={asString(cfg.defaultDurationMinutes)}
              onChange={(e) => setCfg({ defaultDurationMinutes: toIntStr(e.target.value) })}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="90"
              disabled={disabled}
            />
          </label>

          <label className="md:col-span-4 text-sm">
            <div className="font-medium mb-1">Đặt trước tối thiểu (phút)</div>
            <input
              inputMode="numeric"
              value={asString(cfg.minBookingLeadTimeMinutes)}
              onChange={(e) => setCfg({ minBookingLeadTimeMinutes: toIntStr(e.target.value) })}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="30"
              disabled={disabled}
            />
            <div className="text-[11px] text-gray-400 mt-1">
              Ví dụ: 30 = chỉ cho đặt trước giờ đến ít nhất 30 phút.
            </div>
          </label>

          <label className="md:col-span-4 text-sm">
            <div className="font-medium mb-1">Cho phép đến trễ (phút)</div>
            <input
              inputMode="numeric"
              value={asString(cfg.graceArrivalMinutes)}
              onChange={(e) => setCfg({ graceArrivalMinutes: toIntStr(e.target.value) })}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="10"
              disabled={disabled}
            />
            <div className="text-[11px] text-gray-400 mt-1">
              Ví dụ: 10 = trễ 10 phút vẫn giữ bàn.
            </div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <label className="md:col-span-4 text-sm">
            <div className="font-medium mb-1">Hủy miễn phí trước (phút)</div>
            <input
              inputMode="numeric"
              value={asString(cfg.freeCancelMinutes)}
              onChange={(e) => setCfg({ freeCancelMinutes: toIntStr(e.target.value) })}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="60"
              disabled={disabled}
            />
            <div className="text-[11px] text-gray-400 mt-1">
              Ví dụ: 60 = hủy trước giờ đến 60 phút thì không mất phí.
            </div>
          </label>

          <label className="md:col-span-4 text-sm">
            <div className="font-medium mb-1">Hạn thanh toán (phút)</div>
            <input
              inputMode="numeric"
              value={asString(cfg.pendingPaymentExpireMinutes)}
              onChange={(e) => setCfg({ pendingPaymentExpireMinutes: toIntStr(e.target.value) })}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="15"
              disabled={disabled}
            />
            <div className="text-[11px] text-gray-400 mt-1">
              Ví dụ: 15 = quá 15 phút chưa thanh toán thì đơn hết hạn.
            </div>
          </label>

          <label className="md:col-span-4 text-sm">
            <div className="font-medium mb-1">Số bàn tối đa / 1 đơn</div>
            <input
              inputMode="numeric"
              value={asString(cfg.maxTablesPerBooking)}
              onChange={(e) => setCfg({ maxTablesPerBooking: toIntStr(e.target.value) })}
              className="w-full border rounded-xl px-3 py-2"
              placeholder="3"
              disabled={disabled}
            />
          </label>
        </div>
      </div>
    </details>
  );
}