// src/features/partner/components/restaurant/form/controls/TableTypesEditor.jsx
import { PlusIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  asArray,
  asString,
  sanitizeIntStr,
  sanitizeNumberStr,
  normalizeTableType,
  parseIntList,
} from "../../../../utils/restaurantFormUtils";

export default function TableTypesEditor({ value = [], onChange, disabled }) {
  const { t: tr } = useTranslation();
  const DurationsHint = tr("partner.table_types.durations_hint");
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
    <div className="rounded-2xl border bg-white dark:bg-gray-800 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{tr("partner.table_types.title")}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {tr("partner.table_types.subtitle")}
          </div>
        </div>

        <button
          type="button"
          onClick={add}
          disabled={disabled}
          className="px-3 py-2 rounded-xl border hover:bg-gray-50 flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <PlusIcon className="h-4 w-4" />
          {tr("partner.table_types.add")}
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-sm text-gray-500 dark:text-gray-400">{tr("partner.table_types.empty")}</div>
      ) : (
        <div className="space-y-3">
          {list.map((t, idx) => (
            <div key={idx} className="rounded-2xl border p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900 dark:text-gray-100">
                    {tr("partner.table_types.item_title", { index: idx + 1, name: t.name || tr("partner.table_types.unnamed") })}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {tr("partner.table_types.code_label", { code: t.id || tr("partner.table_types.code_auto") })}
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => move(idx, -1)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    title={tr("partner.table_types.move_up")}
                    disabled={disabled}
                  >
                    <ChevronUpIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(idx, 1)}
                    className="p-2 rounded-lg hover:bg-gray-100"
                    title={tr("partner.table_types.move_down")}
                    disabled={disabled}
                  >
                    <ChevronDownIcon className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(idx)}
                    className="p-2 rounded-lg hover:bg-red-50"
                    title={tr("partner.table_types.delete")}
                    disabled={disabled}
                  >
                    <TrashIcon className="h-5 w-5 text-red-600" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <label className="text-sm">
                  <div className="font-medium mb-1">{tr("partner.table_types.name_label")}</div>
                  <input
                    value={asString(t.name)}
                    onChange={(e) => patch(idx, { name: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder={tr("partner.table_types.name_placeholder")}
                    disabled={disabled}
                  />
                </label>

                <label className="text-sm">
                  <div className="font-medium mb-1">{tr("partner.table_types.code_input_label")}</div>
                  <input
                    value={asString(t.id)}
                    onChange={(e) => patch(idx, { id: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder={tr("partner.table_types.code_input_placeholder")}
                    disabled={disabled}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <label className="text-sm md:col-span-3">
                  <div className="font-medium mb-1">{tr("partner.table_types.seats_label")}</div>
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
                  <div className="font-medium mb-1">{tr("partner.table_types.min_people_label")}</div>
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
                  <div className="font-medium mb-1">{tr("partner.table_types.max_people_label")}</div>
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
                  <div className="font-medium mb-1">{tr("partner.table_types.total_tables_label")}</div>
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

              {(() => {
                const seats = Number(t.seats);
                const min = Number(t.minPeople);
                const max = Number(t.maxPeople);
                const issues = [];
                if (Number.isFinite(min) && Number.isFinite(max) && min > 0 && max > 0 && min > max) {
                  issues.push(tr("partner.table_types.err_min_gt_max"));
                }
                if (Number.isFinite(max) && Number.isFinite(seats) && max > 0 && seats > 0 && max > seats) {
                  issues.push(tr("partner.table_types.err_max_gt_seats"));
                }
                if (!issues.length) return null;
                return (
                  <div className="text-xs text-red-600 space-y-0.5">
                    {issues.map((m, i) => (
                      <div key={i}>{m}</div>
                    ))}
                  </div>
                );
              })()}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <label className="text-sm md:col-span-4">
                  <div className="font-medium mb-1">{tr("partner.table_types.deposit_label")}</div>
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
                  <div className="font-medium mb-1">{tr("partner.table_types.currency_label")}</div>
                  <input
                    value={asString(t.currencyCode || "VND")}
                    onChange={(e) => patch(idx, { currencyCode: e.target.value })}
                    className="w-full border rounded-xl px-3 py-2"
                    placeholder="VND"
                    disabled={disabled}
                  />
                  <div className="text-[11px] text-gray-400 mt-1">{tr("partner.table_types.currency_hint")}</div>
                </label>

                <label className="text-sm md:col-span-2 flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    checked={!!t.vip}
                    onChange={(e) => patch(idx, { vip: e.target.checked })}
                    disabled={disabled}
                  />
                  <span className="font-medium">{tr("partner.table_types.vip")}</span>
                </label>

                <label className="text-sm md:col-span-2 flex items-center gap-2 mt-6">
                  <input
                    type="checkbox"
                    checked={!!t.privateRoom}
                    onChange={(e) => patch(idx, { privateRoom: e.target.checked })}
                    disabled={disabled}
                  />
                  <span className="font-medium">{tr("partner.table_types.private_room")}</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                <label className="text-sm md:col-span-8">
                  <div className="font-medium mb-1">{tr("partner.table_types.allowed_durations_label")}</div>
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
                  <div className="font-medium mb-1">{tr("partner.table_types.default_duration_label")}</div>
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
                <div className="font-medium mb-1">{tr("partner.table_types.note_label")}</div>
                <textarea
                  value={asString(t.note)}
                  onChange={(e) => patch(idx, { note: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 min-h-[90px]"
                  placeholder={tr("partner.table_types.note_placeholder")}
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