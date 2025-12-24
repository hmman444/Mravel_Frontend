// src/features/partner/components/restaurant/form/controls/TableTypesEditor.jsx
import { PlusIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useMemo } from "react";
import {
  asArray,
  asString,
  sanitizeIntStr,
  sanitizeNumberStr,
  normalizeTableType,
  parseIntList,
} from "../../../../utils/restaurantFormUtils";

const DurationsHint = "Nhập dạng: 60, 90, 120 (phút).";

export default function TableTypesEditor({ value = [], onChange, disabled }) {
  const list = useMemo(() => asArray(value).map(normalizeTableType), [value]);

  const emit = (next) => {
    try {
      onChange?.(next);
    } catch (e) {
      console.error(e);
    }
  };

  const add = () => {
    emit([
      ...list,
      normalizeTableType({
        id: "",
        name: "",
        seats: "",
        minPeople: "",
        maxPeople: "",
        totalTables: "",
        depositPrice: "",
        currencyCode: "VND",
        vip: false,
        privateRoom: false,
        allowedDurationsMinutes: [60, 90, 120],
        defaultDurationMinutes: "90",
        note: "",
      }),
    ]);
  };

  const remove = (idx) => emit(list.filter((_, i) => i !== idx));

  const move = (idx, dir) => {
    const arr = [...list];
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[idx], arr[j]] = [arr[j], arr[idx]];
    emit(arr);
  };

  const patch = (idx, p) => {
    const arr = list.map((x, i) => (i === idx ? normalizeTableType({ ...x, ...(p || {}) }) : x));
    emit(arr);
  };

  const setDurations = (idx, raw) => {
    patch(idx, { allowedDurationsMinutes: parseIntList(raw) });
  };

  return (
    <div className="rounded-2xl border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">Loại bàn</div>
          <div className="text-xs text-gray-500 mt-0.5">
            Mỗi loại bàn tương ứng cấu hình số người / số bàn / tiền cọc / thời lượng.
          </div>
        </div>

        <button
          type="button"
          onClick={add}
          disabled={disabled}
          className="px-3 py-2 rounded-xl border hover:bg-gray-50 flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <PlusIcon className="h-4 w-4" />
          Thêm loại bàn
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-sm text-gray-500">Chưa có loại bàn.</div>
      ) : (
        <div className="space-y-3">
          {list.map((t, idx) => (
            <div key={idx} className="rounded-2xl border p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">
                    Loại bàn #{idx + 1} — {t.name || "(chưa đặt tên)"}
                  </div>
                  <div className="text-xs text-gray-500">
                    Mã loại bàn: {t.id || "để trống (tự tạo)"}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    title="Đưa lên"
                    disabled={disabled}
                  >
                    <ChevronUpIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    title="Đưa xuống"
                    disabled={disabled}
                  >
                    <ChevronDownIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="p-2 rounded-lg hover:bg-red-50"
                    title="Xóa loại bàn"
                    disabled={disabled}
                  >
                    <TrashIcon className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="text-sm">
                  <div className="font-medium mb-1">Tên loại bàn *</div>
                  <input
                    value={asString(t.name)}
                    onChange={(e) => patch(idx, { name: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="Ví dụ: Bàn 2 người / Bàn VIP..."
                    disabled={disabled}
                  />
                </label>

                <label className="text-sm">
                  <div className="font-medium mb-1">Mã loại bàn (để trống = tự tạo)</div>
                  <input
                    value={asString(t.id)}
                    onChange={(e) => patch(idx, { id: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="Không bắt buộc"
                    disabled={disabled}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <label className="text-sm md:col-span-3">
                  <div className="font-medium mb-1">Số chỗ ngồi</div>
                  <input
                    inputMode="numeric"
                    value={asString(t.seats)}
                    onChange={(e) => patch(idx, { seats: sanitizeIntStr(e.target.value) })}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="2"
                    disabled={disabled}
                  />
                </label>

                <label className="text-sm md:col-span-3">
                  <div className="font-medium mb-1">Số người tối thiểu</div>
                  <input
                    inputMode="numeric"
                    value={asString(t.minPeople)}
                    onChange={(e) => patch(idx, { minPeople: sanitizeIntStr(e.target.value) })}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="1"
                    disabled={disabled}
                  />
                </label>

                <label className="text-sm md:col-span-3">
                  <div className="font-medium mb-1">Số người tối đa</div>
                  <input
                    inputMode="numeric"
                    value={asString(t.maxPeople)}
                    onChange={(e) => patch(idx, { maxPeople: sanitizeIntStr(e.target.value) })}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="2"
                    disabled={disabled}
                  />
                </label>

                <label className="text-sm md:col-span-3">
                  <div className="font-medium mb-1">Tổng số bàn</div>
                  <input
                    inputMode="numeric"
                    value={asString(t.totalTables)}
                    onChange={(e) => patch(idx, { totalTables: sanitizeIntStr(e.target.value) })}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="10"
                    disabled={disabled}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <label className="text-sm md:col-span-4">
                  <div className="font-medium mb-1">Tiền cọc (nếu có)</div>
                  <input
                    inputMode="decimal"
                    value={asString(t.depositPrice)}
                    onChange={(e) => patch(idx, { depositPrice: sanitizeNumberStr(e.target.value) })}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="100000"
                    disabled={disabled}
                  />
                </label>

                <label className="text-sm md:col-span-4">
                  <div className="font-medium mb-1">Đơn vị tiền tệ</div>
                  <input
                    value={asString(t.currencyCode || "VND")}
                    onChange={(e) => patch(idx, { currencyCode: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="VND"
                    disabled={disabled}
                  />
                  <div className="text-[11px] text-gray-400 mt-1">Để trống hệ thống sẽ mặc định là VND.</div>
                </label>

                <label className="text-sm md:col-span-2 flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    checked={!!t.vip}
                    onChange={(e) => patch(idx, { vip: e.target.checked })}
                    disabled={disabled}
                  />
                  <span className="font-medium">Bàn VIP</span>
                </label>

                <label className="text-sm md:col-span-2 flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    checked={!!t.privateRoom}
                    onChange={(e) => patch(idx, { privateRoom: e.target.checked })}
                    disabled={disabled}
                  />
                  <span className="font-medium">Phòng riêng</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <label className="text-sm md:col-span-8">
                  <div className="font-medium mb-1">Thời lượng cho phép (phút)</div>
                  <input
                    value={Array.isArray(t.allowedDurationsMinutes) ? t.allowedDurationsMinutes.join(", ") : ""}
                    onChange={(e) => setDurations(idx, e.target.value)}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="60, 90, 120"
                    disabled={disabled}
                  />
                  <div className="text-[11px] text-gray-400 mt-1">{DurationsHint}</div>
                </label>

                <label className="text-sm md:col-span-4">
                  <div className="font-medium mb-1">Thời lượng mặc định (phút)</div>
                  <input
                    inputMode="numeric"
                    value={asString(t.defaultDurationMinutes)}
                    onChange={(e) => patch(idx, { defaultDurationMinutes: sanitizeIntStr(e.target.value) })}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="90"
                    disabled={disabled}
                  />
                </label>
              </div>

              <label className="text-sm">
                <div className="font-medium mb-1">Ghi chú</div>
                <textarea
                  value={asString(t.note)}
                  onChange={(e) => patch(idx, { note: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 min-h-[90px]"
                  placeholder="Ví dụ: loại bàn này chỉ nhận khách sau 18h..."
                  disabled={disabled}
                />
              </label>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}