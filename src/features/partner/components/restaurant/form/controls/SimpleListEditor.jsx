import { PlusIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export default function SimpleListEditor({
  title,
  hint,
  value = [],
  onChange,
  disabled,
  placeholder = "Nhập...",
}) {
  const list = Array.isArray(value) ? value : [];

  const emit = (next) => onChange?.(next);

  const add = () => emit([...list, ""]);
  const remove = (i) => emit(list.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const arr = [...list];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    emit(arr);
  };
  const patch = (i, v) => emit(list.map((x, idx) => (idx === i ? v : x)));

  return (
    <div className="rounded-2xl border bg-white p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">{title}</div>
          {hint ? <div className="text-xs text-gray-500 mt-0.5">{hint}</div> : null}
        </div>
        <button
          type="button"
          onClick={add}
          disabled={disabled}
          className="px-3 py-2 rounded-xl border hover:bg-gray-50 flex items-center gap-2 text-sm disabled:opacity-50"
        >
          <PlusIcon className="h-4 w-4" />
          Thêm
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-sm text-gray-500">Chưa có.</div>
      ) : (
        <div className="space-y-2">
          {list.map((x, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={x || ""}
                onChange={(e) => patch(i, e.target.value)}
                className="flex-1 border rounded-xl px-3 py-2 text-sm"
                placeholder={placeholder}
                disabled={disabled}
              />
              <button type="button" onClick={() => move(i, -1)} className="p-2 rounded-lg hover:bg-gray-100" disabled={disabled}>
                <ChevronUpIcon className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => move(i, 1)} className="p-2 rounded-lg hover:bg-gray-100" disabled={disabled}>
                <ChevronDownIcon className="h-5 w-5" />
              </button>
              <button type="button" onClick={() => remove(i)} className="p-2 rounded-lg hover:bg-red-50" disabled={disabled}>
                <TrashIcon className="h-5 w-5 text-red-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}