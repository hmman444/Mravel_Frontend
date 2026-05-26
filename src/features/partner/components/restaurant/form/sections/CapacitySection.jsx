// src/features/partner/components/restaurant/form/sections/CapacitySection.jsx
const sanitizeIntStr = (v) => String(v ?? "").replace(/[^\d]/g, "");

export default function CapacitySection({ form, setField, disabled }) {
  const cap = form.capacity || {};
  const update = (patch) => setField("capacity", { ...cap, ...patch });

  const groupExceedsTotal = (() => {
    const total = Number(cap.totalCapacity);
    const group = Number(cap.maxGroupSize);
    return Number.isFinite(total) && Number.isFinite(group) && total > 0 && group > total;
  })();

  return (
    <details className="group">
      <summary className="cursor-pointer select-none font-semibold">
        Sức chứa & phòng riêng
      </summary>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="text-sm">
          <div className="font-medium mb-1">Tổng sức chứa tối đa (khách)</div>
          <input
            inputMode="numeric"
            value={cap.totalCapacity ?? ""}
            onChange={(e) => update({ totalCapacity: sanitizeIntStr(e.target.value) })}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="Ví dụ: 200"
            disabled={disabled}
          />
        </label>

        <label className="text-sm">
          <div className="font-medium mb-1">Sức chứa nhóm tối đa</div>
          <input
            inputMode="numeric"
            value={cap.maxGroupSize ?? ""}
            onChange={(e) => update({ maxGroupSize: sanitizeIntStr(e.target.value) })}
            className="w-full border rounded-xl px-3 py-2"
            placeholder="Ví dụ: 20"
            disabled={disabled}
          />
          {groupExceedsTotal && (
            <div className="mt-1 text-xs text-red-600">
              Sức chứa nhóm đang lớn hơn tổng sức chứa.
            </div>
          )}
        </label>

        <label className="text-sm flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={!!cap.hasPrivateRooms}
            onChange={(e) => update({ hasPrivateRooms: e.target.checked })}
            disabled={disabled}
          />
          <span className="font-medium">Có phòng riêng</span>
        </label>

        <label className="text-sm flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            checked={!!cap.hasOutdoorSeating}
            onChange={(e) => update({ hasOutdoorSeating: e.target.checked })}
            disabled={disabled}
          />
          <span className="font-medium">Có khu vực ngoài trời / sân vườn</span>
        </label>

        {cap.hasPrivateRooms && (
          <>
            <label className="text-sm">
              <div className="font-medium mb-1">Số phòng riêng</div>
              <input
                inputMode="numeric"
                value={cap.privateRoomCount ?? ""}
                onChange={(e) => update({ privateRoomCount: sanitizeIntStr(e.target.value) })}
                className="w-full border rounded-xl px-3 py-2"
                placeholder="Ví dụ: 3"
                disabled={disabled}
              />
            </label>

            <label className="text-sm">
              <div className="font-medium mb-1">Sức chứa phòng riêng tối đa</div>
              <input
                inputMode="numeric"
                value={cap.maxPrivateRoomCapacity ?? ""}
                onChange={(e) => update({ maxPrivateRoomCapacity: sanitizeIntStr(e.target.value) })}
                className="w-full border rounded-xl px-3 py-2"
                placeholder="Ví dụ: 12"
                disabled={disabled}
              />
            </label>
          </>
        )}
      </div>
    </details>
  );
}
