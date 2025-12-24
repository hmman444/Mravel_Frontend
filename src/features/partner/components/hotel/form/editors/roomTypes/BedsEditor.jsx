import { TrashIcon } from "@heroicons/react/24/outline";
import { TEXT } from "./roomTypes.text";
import { asArray, asPosInt, asString, normalizeBed } from "./roomTypes.utils";

export default function BedsEditor({ beds = [], onChange }) {
  const list = asArray(beds).map(normalizeBed);

  const emit = (next) => {
    try {
      onChange?.(next);
    } catch (e) {
      console.error("BedsEditor onChange error:", e);
    }
  };

  const addBed = () => emit([...list, { type: "SINGLE", count: 1 }]);

  const setBed = (idx, patch) => {
    const next = list.map((b, i) => (i === idx ? normalizeBed({ ...b, ...(patch || {}) }) : b));
    emit(next);
  };

  const removeBed = (idx) => {
    const next = list.filter((_, i) => i !== idx);
    emit(next.length ? next : [{ type: "SINGLE", count: 1 }]);
  };

  return (
    <div className="rounded-2xl border p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">{TEXT.BEDS_TITLE}</div>
        <button
          type="button"
          onClick={addBed}
          className="text-xs px-3 py-1.5 rounded-xl border hover:bg-gray-50"
        >
          {TEXT.ADD_BED}
        </button>
      </div>

      {list.map((b, idx) => (
        <div key={idx} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
          <select
            value={asString(b.type, "SINGLE")}
            onChange={(e) => setBed(idx, { type: e.target.value })}
            className="md:col-span-6 border rounded-xl px-3 py-2 text-sm"
          >
            {Object.keys(TEXT.BED_TYPES).map((k) => (
              <option key={k} value={k}>
                {TEXT.BED_TYPES[k]}
              </option>
            ))}
          </select>

          <input
            type="number"
            min={1}
            value={asPosInt(b.count, 1) || 1}
            onChange={(e) => setBed(idx, { count: asPosInt(e.target.value, 1) || 1 })}
            className="md:col-span-4 border rounded-xl px-3 py-2 text-sm"
            placeholder={TEXT.BED_COUNT}
          />

          <button
            type="button"
            onClick={() => removeBed(idx)}
            className="md:col-span-2 p-2 rounded-xl hover:bg-red-50 flex justify-center"
            title={TEXT.DELETE}
          >
            <TrashIcon className="h-5 w-5 text-red-600" />
          </button>
        </div>
      ))}
    </div>
  );
}